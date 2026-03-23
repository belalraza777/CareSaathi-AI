import { llm } from "../llm/model.js";

function normalizeContent(content) {
  // Normalize LangChain message content to a plain string.
  if (Array.isArray(content)) {
    return content.map((chunk) => (typeof chunk === "string" ? chunk : chunk?.text || "")).join(" ");
  }

  return String(content || "");
}

export async function routerAgent(state) {
  const prompt = `
You are an intent router for a medical consultation backend.

Classify the user message into exactly one label:
- chat: greetings, casual conversation, thanks, platform questions, or non-medical discussion
- symptom: any mention of symptoms, pain, illness, health concern, diagnosis question, treatment question, medical urgency, or request for medical advice

Rules:
- If the message is ambiguous but health-related, choose symptom.
- Return exactly one lowercase word.
- Allowed outputs only: chat or symptom.

User message:
${state.input}
`;

  const result = await llm.invoke(prompt);
  const raw = normalizeContent(result.content).trim().toLowerCase();
  const intent = raw === "symptom" ? "symptom" : "chat";

  return { intent };
}
