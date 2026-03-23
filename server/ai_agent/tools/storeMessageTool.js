import mongoose from "mongoose";
import Message from "../../models/messageModel.js";

// Persist one chat message in the messages collection.
export async function storeMessage(consultationId, role, message) {
  if (!consultationId || !mongoose.Types.ObjectId.isValid(consultationId)) {
    throw new Error("Invalid consultationId");
  }

  await Message.create({
    consultationId: new mongoose.Types.ObjectId(consultationId),
    role,
    message,
    timestamp: new Date(),
  });
}
