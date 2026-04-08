import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { Pinecone } from "@pinecone-database/pinecone";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

// Define input schema
const ragSchema = z.object({
  query: z.string().optional(),
  input: z.any().optional(),
});

// Create embeddings instance
const createEmbeddings = () => {
  if (!process.env.HF_API_KEY) throw new Error("Missing HF_API_KEY");
  return new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HF_API_KEY,
    model: "sentence-transformers/all-MiniLM-L6-v2",
  });
};

// Create Pinecone index instance
const createIndex = () => {
  if (!process.env.PINECONE_API_KEY) throw new Error("Missing PINECONE_API_KEY");
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const indexName =
    process.env.PINECONE_INDEX ||
    process.env.PINECONE_INDEX_NAME ||
    "virat-index";
  return pc.index(indexName);
};

export const retrieveMedicalKnowledgeTool = tool(
  async (args) => {
    try {
      // Normalize query from different formats
      const raw = args?.query ?? args?.input;
      let query = "";

      if (typeof raw === "string") {
        try {
          const parsed = JSON.parse(raw);
          query = parsed?.query || raw;
        } catch {
          query = raw;
        }
      } else if (typeof raw === "object") {
        query = raw?.query || "";
      }

      query = String(query).trim();
      if (!query) {
        return { query: "", matches: [], note: "No query provided" };
      }

      // Generate embedding
      const embeddings = createEmbeddings();
      const vector = await embeddings.embedQuery(query);

      // Query Pinecone
      const index = createIndex();
      const namespace = process.env.PINECONE_NAMESPACE;
      const queryClient = namespace ? index.namespace(namespace) : index;

      const result = await queryClient.query({
        vector,
        topK: 5,
        includeMetadata: true,
      });

      // Handle empty results
      if (!result.matches || result.matches.length === 0) {
        return {
          query,
          matches: [],
          note: "No matches found (check index/namespace/data)",
        };
      }

      // Format matches
      const matches = result.matches.map((m) => ({
        score: Number((m.score || 0).toFixed(4)),
        source: m.metadata?.source || "unknown",
        text: m.metadata?.text || "",
      }));

      return { query, matches };
      
    } catch (err) {
      // Return error safely
      return { matches: [], error: err.message };
    }
  },
  {
    name: "retrieve_medical_knowledge",
    description: "Retrieve top 5 relevant medical knowledge snippets for a query.",
    schema: ragSchema,
  }
);