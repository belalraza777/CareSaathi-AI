import { llm } from "../llm/model.js";

function normalizeContent(content) {
  // Normalize LangChain message content to a plain string.
  if (Array.isArray(content)) {
    return content.map((chunk) => (typeof chunk === "string" ? chunk : chunk?.text || "")).join(" ");
  }

  return String(content || "");
}

export async function riskAgent(state) {
  const prompt = `
You are a medical risk triage classifier.

Classify the patient risk level using exactly one label:
- Mild
- Moderate
- Critical

Guidance:
- Critical: chest pain, severe breathing difficulty, stroke-like symptoms, seizures, loss of consciousness, major bleeding, suicidal intent, or other emergency warning signs.
- Moderate: persistent or worsening symptoms, notable pain, fever, dehydration risk, functional limitation, or symptoms that should be evaluated soon.
- Mild: minor, stable, low-risk symptoms without red flags.

Rules:
- Prioritize safety when uncertain.
- Return only one label with no explanation.

Symptoms:
${state.symptoms}
`;

  const result = await llm.invoke(prompt);
  // Normalize free-form model output into the required risk taxonomy.
  const text = normalizeContent(result.content).trim().toLowerCase();
  if (text.includes("critical") || text.includes("high")) {
    return { risk: "Critical" };
  }
  if (text.includes("moderate") || text.includes("medium")) {
    return { risk: "Moderate" };
  }
  return { risk: "Mild" };
}
