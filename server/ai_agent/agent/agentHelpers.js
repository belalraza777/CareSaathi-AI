import mongoose from "mongoose";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import Message from "../../models/messageModel.js";

// Max prior messages loaded per consultation (latency vs context).
const HISTORY_LIMIT = 12;

// Mongo chat rows → LangChain HumanMessage / AIMessage for the graph.
export async function loadHistory(consultationId) {
  if (!consultationId || !mongoose.Types.ObjectId.isValid(String(consultationId))) {
    return [];
  }
  const rows = await Message.find({
    consultationId: new mongoose.Types.ObjectId(String(consultationId)),
  })
    .sort({ timestamp: 1 })
    .select({ role: 1, message: 1, _id: 0 })
    .limit(HISTORY_LIMIT)
    .lean();

  return rows.map((row) =>
    row.role === "assistant" ? new AIMessage(row.message) : new HumanMessage(row.message)
  );
}
