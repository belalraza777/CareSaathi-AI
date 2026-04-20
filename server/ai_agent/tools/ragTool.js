import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { Pinecone } from "@pinecone-database/pinecone";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

/* =======================
   BASIC SETTINGS
======================= */
const DEFAULT_TOP_K = 5;   // how many results to return by default
const MAX_TOP_K = 20;      // maximum limit (safety)

/* =======================
   GLOBAL INSTANCES (reuse to save time)
======================= */
let embeddings = null; // for converting text → vector
let index = null;      // Pinecone index connection

/* =======================
   INPUT VALIDATION
======================= */
const schema = z.object({
  query: z.string().min(1).optional(),   // user question (optional if provided in input)
  input: z.any().optional(),             // compatibility: supports input payload shape
  topK: z.number().min(1).max(MAX_TOP_K).optional(), // optional result count
  namespaces: z.array(z.string()).optional(),        // optional namespaces
});

/* =======================
   HELPER FUNCTIONS
======================= */

// Make sure topK is valid and safe
function getTopK(value) {
  if (!value) return DEFAULT_TOP_K;
  return Math.max(1, Math.min(MAX_TOP_K, Math.floor(value)));
}

// Normalize both payload styles: { query } and { input: { query } } / { input: "{...}" }
function normalizePayload(args = {}) {
  let query = typeof args.query === "string" ? args.query.trim() : "";
  let topK = args.topK;
  let namespaces = Array.isArray(args.namespaces) ? [...args.namespaces] : [];

  if (args.input !== undefined && args.input !== null) {
    if (typeof args.input === "string") {
      try {
        const parsed = JSON.parse(args.input);
        if (parsed && typeof parsed === "object") {
          if (!query && typeof parsed.query === "string") {
            query = parsed.query.trim();
          }
          if (topK == null) {
            topK = parsed.topK;
          }
          if (!namespaces.length && Array.isArray(parsed.namespaces)) {
            namespaces = [...parsed.namespaces];
          }
        } else if (!query) {
          query = args.input.trim();
        }
      } catch {
        if (!query) {
          query = args.input.trim();
        }
      }
    } else if (typeof args.input === "object") {
      if (!query && typeof args.input.query === "string") {
        query = args.input.query.trim();
      }
      if (topK == null) {
        topK = args.input.topK;
      }
      if (!namespaces.length && Array.isArray(args.input.namespaces)) {
        namespaces = [...args.input.namespaces];
      }
    }
  }

  return {
    query,
    topK,
    namespaces,
  };
}

// Create embeddings client (only once)
function getEmbeddings() {
  if (!process.env.HF_API_KEY) {
    throw new Error("HF_API_KEY missing");
  }

  if (!embeddings) {
    embeddings = new HuggingFaceInferenceEmbeddings({
      apiKey: process.env.HF_API_KEY,
      model:
        process.env.RAG_EMBEDDING_MODEL ||
        "sentence-transformers/all-MiniLM-L6-v2",
    });
  }

  return embeddings;
}

// Connect to Pinecone (only once)
function getIndex() {
  if (!process.env.PINECONE_API_KEY) {
    throw new Error("PINECONE_API_KEY missing");
  }

  const name =
    process.env.PINECONE_INDEX || process.env.PINECONE_INDEX_NAME;

  if (!name) {
    throw new Error("PINECONE_INDEX missing");
  }

  if (!index) {
    const client = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    index = client.index(name);
  }

  return index;
}

// Get all namespaces from Pinecone (no cache, always fresh)
async function getNamespaces(idx) {
  try {
    const stats = await idx.describeIndexStats();

    // Only keep namespaces that actually have data
    return Object.entries(stats.namespaces || {})
      .filter(([, v]) => v.recordCount > 0)
      .map(([k]) => k);
  } catch {
    return []; // if error, just return empty
  }
}

// Remove duplicates and keep best scoring results
function mergeResults(items, topK) {
  const map = new Map();

  for (const item of items) {
    // unique key (id or fallback using text)
    const key =
      item.id || `${item.namespace}:${(item.text || "").slice(0, 100)}`;

    // keep only highest score for each key
    if (!map.has(key) || map.get(key).score < item.score) {
      map.set(key, item);
    }
  }

  // sort by best score first
  return Array.from(map.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/* =======================
   MAIN TOOL
======================= */
export const retrieveMedicalKnowledgeTool = tool(
  async (args) => {
    try {
      const normalized = normalizePayload(args);
      const query = normalized.query;
      const topK = normalized.topK;
      const namespaces = normalized.namespaces;

      if (!query) {
        return {
          query: "",
          matches: [],
          note: "No query provided",
        };
      }

      const k = getTopK(topK);

      // 1. Convert query text into vector
      const vector = await getEmbeddings().embedQuery(query);

      // 2. Get Pinecone index
      const idx = getIndex();

      // 3. Get namespaces (user + env + discovered)
      const discovered = await getNamespaces(idx);

      const allNamespaces = [
        ...(namespaces || []),                         // from user
        process.env.PINECONE_NAMESPACE,               // single env namespace
        ...(process.env.PINECONE_NAMESPACES || "").split(","), // multiple env
        ...discovered,                                // auto discovered
      ]
        .filter(Boolean)
        .map((n) => String(n).trim());

      // remove duplicates
      const uniqueNamespaces = [...new Set(allNamespaces)];

      // 4. Search in all namespaces
      const results = await Promise.allSettled(
        uniqueNamespaces.map((ns) =>
          idx.namespace(ns).query({
            vector,
            topK: k,
            includeMetadata: true,
          })
        )
      );

      const matches = [];

      // collect results safely (ignore failed ones)
      for (let i = 0; i < results.length; i++) {
        if (results[i].status !== "fulfilled") continue;

        const ns = uniqueNamespaces[i];
        const res = results[i].value.matches || [];

        for (const m of res) {
          matches.push({
            id: m.id,
            score: Number((m.score || 0).toFixed(4)),
            text: m.metadata?.text || "",
            source: m.metadata?.source || "unknown",
            namespace: ns,
          });
        }
      }

      // clean + sort results
      const final = mergeResults(matches, k);

      // 5. If nothing found → fallback search (no namespace)
      if (!final.length) {
        const fallback = await idx.query({
          vector,
          topK: k,
          includeMetadata: true,
        });

        return {
          query,
          matches: (fallback.matches || []).map((m) => ({
            score: Number((m.score || 0).toFixed(4)),
            text: m.metadata?.text || "",
            source: m.metadata?.source || "unknown",
            namespace: "default",
          })),
        };
      }

      // normal response
      return {
        query,
        matches: final,
        namespaces: uniqueNamespaces,
      };
    } catch (err) {
      return {
        error: err.message,
        matches: [],
      };
    }
  },
  {
    name: "retrieve_medical_knowledge",
    description:
      "Search medical knowledge using vector similarity.",
    schema,
  }
);