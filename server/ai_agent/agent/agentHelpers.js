import mongoose from "mongoose";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import Message from "../../models/messageModel.js";

const HISTORY_LIMIT = 20;

// -------------------------
// Load Conversation History
// -------------------------
export async function loadHistory(consultationId) {
  if (!mongoose.Types.ObjectId.isValid(String(consultationId))) {
    return [];
  }

  try {
    const rows = await Message.find({
      consultationId: new mongoose.Types.ObjectId(String(consultationId)),
    })
      .sort({ timestamp: -1, _id: -1 })
      .limit(HISTORY_LIMIT)
      .select({ role: 1, message: 1, _id: 0 })
      .lean();

    // Keep only the latest messages, then replay them oldest-to-newest for the LLM.
    const orderedRows = rows.reverse();

    return orderedRows
      .filter(({ message }) => {
        const text = String(message ?? "").trim();
        return text.length > 0 && text !== "[object Object]";
      })
      .map(({ role, message }) =>
        role === "assistant"
          ? new AIMessage(message)
          : new HumanMessage(message)
      );
  } catch (err) {
    console.error("loadHistory:", err.message);
    return [];
  }
}

// -------------------------
// Normalize LLM Output
// -------------------------
export function normalizeContent(content) {
  if (content == null) return "";

  if (typeof content === "string") return content.trim();

  if (Array.isArray(content)) {
    return content.map((c) => normalizeContent(c)).filter(Boolean).join(" ").trim();
  }

  if (typeof content === "object") {
    // Recursively unwrap common LangChain/Groq content block shapes.
    if (content.text != null) return normalizeContent(content.text);
    if (content.content != null) return normalizeContent(content.content);
    if (content.message != null) return normalizeContent(content.message);
    return "";
  }

  return String(content).trim();

}

