import { llm } from "../llm/model.js";

function normalizeContent(content) {
  // Normalize LangChain message content to a plain string.
  if (Array.isArray(content)) {
    return content.map((chunk) => (typeof chunk === "string" ? chunk : chunk?.text || "")).join(" ");
  }

  return String(content || "");
}

//CHat agent for general conversational questions, with safety rules for medical context.
export async function chatAgent(state) {
  const prompt = `
You are the conversational assistant for an AI doctor platform.

Your job:
- Answer general, non-diagnostic chat questions naturally.
- Be concise, calm, and professional.
- Use the conversation history when helpful.
- Do not invent medical facts.
- If the user is clearly asking about symptoms, health risk, diagnosis, treatment, or urgency, respond briefly and safely without prescribing medicines.

Response rules:
- Keep the answer short and practical.
- Do not mention internal routing or system behavior.
- Do not use bullet points unless the user asks for a list.

Conversation history:
${state.history || "(no prior messages)"}

User message:
${state.input}

Return only the assistant reply.
`;

  const result = await llm.invoke(prompt);
  return { response: normalizeContent(result.content).trim() };
}
