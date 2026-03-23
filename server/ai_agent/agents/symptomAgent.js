import { llm } from "../llm/model.js";

function normalizeContent(content) {
  // Normalize LangChain message content to a plain string.
  if (Array.isArray(content)) {
    return content.map((chunk) => (typeof chunk === "string" ? chunk : chunk?.text || "")).join(" ");
  }

  return String(content || "");
}

export async function symptomAgent(state) {
  const prompt = `
You extract symptom information from patient messages for downstream risk assessment.

Rules:
- Extract only symptoms, conditions, durations, affected body areas, and severity clues mentioned by the user.
- Keep the output concise.
- Do not add explanations or advice.
- If no symptoms are present, return: none

Return format:
- A short comma-separated list or short clinical summary.

User message:
${state.input}
`;

  const result = await llm.invoke(prompt);
  return { symptoms: normalizeContent(result.content).trim() };
}
