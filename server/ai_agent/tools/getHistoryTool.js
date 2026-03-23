import mongoose from "mongoose";
import Message from "../../models/messageModel.js";

// Fetch a short chronological transcript for the active consultation.
export async function getHistoryTool({ consultationId }) {
  if (!consultationId || !mongoose.Types.ObjectId.isValid(consultationId)) {
    return "";
  }

  const history = await Message.find({
    consultationId: new mongoose.Types.ObjectId(consultationId),
  })
    .sort({ timestamp: 1 })
    .limit(10)
    .select({ role: 1, message: 1, _id: 0 })
    .lean();

  return history.map((m) => `${m.role}: ${m.message}`).join("\n");
}
