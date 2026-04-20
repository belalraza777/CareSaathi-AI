import mongoose from "mongoose";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import Message from "../../models/messageModel.js";
import Profile from "../../models/profileModel.js";
import Consultation from "../../models/consultationModel.js";

const HISTORY_LIMIT = 10;

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

const formatList = (value) =>
  Array.isArray(value) && value.length > 0
    ? value.map((item) => String(item)).join(", ")
    : "Unknown";

export async function buildIntakeContextMessage({ userId, consultationId }) {
  if (
    !mongoose.Types.ObjectId.isValid(String(userId ?? "")) ||
    !mongoose.Types.ObjectId.isValid(String(consultationId ?? ""))
  ) {
    return "";
  }

  const userObjectId = new mongoose.Types.ObjectId(String(userId));
  const consultationObjectId = new mongoose.Types.ObjectId(String(consultationId));

  const [profile, consultation] = await Promise.all([
    Profile.findOne({ user: userObjectId })
      .lean()
      .select({ age: 1, gender: 1, allergies: 1, medicalHistory: 1, medications: 1, _id: 0 }),
    Consultation.findOne({ consultationId: consultationObjectId, userId: userObjectId })
      .lean()
      .select({ mainSymptom: 1, symptomDuration: 1, notes: 1, age: 1, gender: 1, height: 1, weight: 1, _id: 0 }),
  ]);

  if (!profile && !consultation) {
    return "";
  }

  const effectiveAge = consultation?.age ?? profile?.age ?? "Unknown";
  const effectiveGender = consultation?.gender ?? profile?.gender ?? "Unknown";

  return [
    "Known patient data from consultation/profile.",
    "Do not re-ask these unless the user corrects them:",
    `- Main symptoms: ${formatList(consultation?.mainSymptom)}`,
    `- Symptom duration: ${consultation?.symptomDuration || "Unknown"}`,
    `- Notes: ${consultation?.notes || "Unknown"}`,
    `- Age: ${effectiveAge}`,
    `- Gender: ${effectiveGender}`,
    `- Height (cm): ${consultation?.height ?? "Unknown"}`,
    `- Weight (kg): ${consultation?.weight ?? "Unknown"}`,
    `- Allergies: ${formatList(profile?.allergies)}`,
    `- Medical history: ${formatList(profile?.medicalHistory)}`,
    `- Current medications: ${formatList(profile?.medications)}`,
  ].join("\n");
}

