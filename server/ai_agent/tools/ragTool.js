import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { Pinecone } from "@pinecone-database/pinecone";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

const ragSchema = z.preprocess(
  (value) => (value && typeof value === "object" ? value : {}),
  z
    .object({
      query: z.string().min(1),
    })
);

let cachedEmbeddings = null;
let cachedIndex = null;

const getEmbeddings = () => {
  if (!cachedEmbeddings) {
    cachedEmbeddings = new HuggingFaceInferenceEmbeddings({
      apiKey: process.env.HF_API_KEY,
      model: "sentence-transformers/all-MiniLM-L6-v2",
    });
  }
  return cachedEmbeddings;
};

const getIndex = () => {
  if (!cachedIndex) {
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const indexName = process.env.PINECONE_INDEX || process.env.PINECONE_INDEX_NAME || "virat-index";
    cachedIndex = pc.index(indexName);
  }
  return cachedIndex;
};

export const retrieveMedicalKnowledgeTool = tool(
  async (args) => {
    try {
      // Keep one clear input field so tool-calling stays deterministic.
      const query = String(args?.query || "").trim();
      if (!query) {
        return JSON.stringify({ query: "", matches: [], note: "No query provided" });
      }

      if (!process.env.PINECONE_API_KEY || !process.env.HF_API_KEY) {
        return JSON.stringify({ query, matches: [], error: "RAG configuration is missing" });
      }

      const vector = await getEmbeddings().embedQuery(query);
      const namespace = process.env.PINECONE_NAMESPACE || "virat-pdf";
      // Query through namespace-scoped index because SDK v6 query payload does not accept namespace.
      const result = await getIndex().namespace(namespace).query({
        vector,
        topK: 5,
        includeMetadata: true,
      });

      // Keep RAG output short so the model focuses on the strongest evidence.
      const matches = (result?.matches || []).map((match) => ({
        score: Number((match?.score || 0).toFixed(4)),
        source: String(match?.metadata?.source || "unknown"),
        text: String(match?.metadata?.text || ""),
      }));

      return JSON.stringify({ query, matches });
    } catch (err) {
      return JSON.stringify({ matches: [], error: `RAG retrieval failed: ${err.message}` });
    }
  },
  {
    name: "retrieve_medical_knowledge",
    description:
      "Retrieve top 5 relevant medical knowledge snippets for a symptom or medical question before final advice.",
    schema: ragSchema,
  }
);
