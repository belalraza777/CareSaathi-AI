import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tools } from "../tools/tools.js";
import SYSTEM_PROMPT, { CASUAL_PROMPT, appMessages } from "./systemPrompt.js";
import { loadHistory } from "./agentHelpers.js";

// Groq model id and max graph steps (each step = model and/or tools).
const MODEL_ID = "llama-3.1-8b-instant";
const RECURSION_LIMIT = 12;

const model = new ChatGroq({
  model: MODEL_ID,
  temperature: 0.35,
  apiKey: process.env.GROQ_API_KEY,
});

// ReAct loop: clinical system prompt + Mongo-backed tools.
const agent = createReactAgent({
  llm: model,
  tools,
  systemPrompt: SYSTEM_PROMPT,
});

// Flatten LangChain message content (string or multimodal chunks) to a string.
function normalizeContent(content) {
  if (Array.isArray(content)) {
    return content
      .map((c) => (typeof c === "string" ? c : c?.text || ""))
      .join(" ")
      .trim();
  }
  return String(content || "").trim();
}

// Strip markdown fences so JSON.parse works on triage output.
function parseTriageJson(raw) {
  const text = normalizeContent(raw)
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// True only for short hi/thanks-style input (skips tool agent for speed).
function isQuickGreeting(message) {
  const t = String(message ?? "").trim();
  if (t.length === 0 || t.length > 100) return false;
  if (/\b(pain|fever|cough|ache|hurt|headache|blood|nausea|dizzy|symptom|sick|injury|chest)\b/i.test(t)) {
    return false;
  }
  return /^(hi|hello|hey|hii|namaste|thanks|thank\s+you|bye|ok|okay|good\s+(morning|afternoon|evening))\b/i.test(
    t
  );
}

// One LLM call: symptoms for DB + emergency short-circuit before the agent.
async function triage(model, message) {
  const triageLlm = model.bind({ maxTokens: 220, temperature: 0.2 });
  const out = await triageLlm.invoke(`
Respond with ONLY valid JSON (no markdown):
{"symptoms":["short phrases"],"emergency":false}
Rules: symptoms empty if none. emergency true only for likely life-threatening cases (stroke, severe bleeding, can't breathe, unconscious). Unsure → false.
User: ${JSON.stringify(message)}
`);
  const parsed = parseTriageJson(out.content);
  if (!parsed || typeof parsed !== "object") {
    return { symptoms: [], emergency: false };
  }
  const symptoms = Array.isArray(parsed.symptoms)
    ? parsed.symptoms.map((s) => String(s).trim()).filter((s) => s && s.toLowerCase() !== "none")
    : [];
  return { symptoms, emergency: Boolean(parsed.emergency) };
}

export async function handleUserMessage({ userId, consultationId, message }) {
  try {
    // Fast path: no triage, no tools.
    if (isQuickGreeting(message)) {
      const history = await loadHistory(consultationId);
      const casual = model.bind({ maxTokens: 220, temperature: 0.72 });
      const out = await casual.invoke([
        new SystemMessage(CASUAL_PROMPT),
        ...history.slice(-6),
        new HumanMessage(message),
      ]);
      return { response: normalizeContent(out.content) || appMessages.fallback, symptoms: [] };
    }

    // Triage + history in parallel.
    const [analysis, history] = await Promise.all([triage(model, message), loadHistory(consultationId)]);

    if (analysis.emergency) {
      return { response: appMessages.emergency, symptoms: analysis.symptoms };
    }

    // Full clinical path: tools read userId/consultationId from configurable.
    const result = await agent.invoke(
      { messages: [...history, new HumanMessage(message)] },
      {
        configurable: { userId: String(userId), consultationId: String(consultationId) },
        recursionLimit: RECURSION_LIMIT,
      }
    );

    // Final assistant turn after tool loop.
    const last = result.messages[result.messages.length - 1];
    const text = normalizeContent(last?.content || "").trim() || appMessages.fallback;
    return { response: text, symptoms: analysis.symptoms };
  } catch (error) {
    console.error(`Agent error [${userId}]:`, error.message);
    throw error;
  }
}
