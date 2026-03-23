import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { HumanMessage } from "@langchain/core/messages";
import { tools } from "../tools/tools.js";
import SYSTEM_PROMPT, { appMessages } from "./systemPrompt.js";
import { loadHistory } from "./agentHelpers.js";

const MODEL_ID = "llama-3.1-8b-instant";

const model = new ChatGroq({
  model: MODEL_ID,
  temperature: 0.35,
  apiKey: process.env.GROQ_API_KEY,
});

function normalizeContent(content) {
  if (Array.isArray(content)) {
    return content
      .map((c) => (typeof c === "string" ? c : c?.text || ""))
      .join(" ")
      .trim();
  }
  return String(content || "").trim();
}

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

async function triage(llm, message) {
  // Quick check: if message is clearly conversational (no health keywords), skip symptom extraction
  const healthKeywords = ['pain', 'hurt', 'sick', 'fever', 'cough', 'cold', 'ache', 'symptom', 'medicine', 'drug', 'allergy', 'bleeding', 'hospital', 'emergency', 'doctor', 'diagnosis', 'treatment', 'blood', 'nausea', 'dizzy', 'headache', 'flu', 'covid', 'rash', 'wound', 'sting', 'burn', 'fracture', 'sprain'];
  const msgLower = message.toLowerCase().replace(/[^a-z\s]/g, '');
  const hasHealthKeyword = healthKeywords.some(kw => msgLower.includes(kw));

  // If no health keywords and message is short/greeting-like, skip expensive LLM call
  if (!hasHealthKeyword && message.length < 50) {
    const greetings = ['hi', 'hello', 'hey', 'thanks', 'thank you', 'bye', 'okay', 'ok', 'sure', 'good', 'morning', 'afternoon', 'evening', 'night'];
    const isGreeting = greetings.some(g => msgLower.includes(g));
    if (isGreeting) {
      return { symptoms: [], emergency: false }; // No symptom extraction for greetings
    }
  }

  const out = await llm.invoke(
    `
Respond with ONLY valid JSON (no markdown):
{"symptoms":["short phrases"],"emergency":false}
Rules: symptoms empty if none or if user only greeting/chatting. emergency true only for likely life-threatening cases (stroke, severe bleeding, can't breathe, unconscious). Unsure → false.
User: ${JSON.stringify(message)}
`,
    { temperature: 0.2, maxTokens: 220 }
  );
  const parsed = parseTriageJson(out.content);
  if (!parsed || typeof parsed !== "object") {
    return { symptoms: [], emergency: false };
  }
  const symptoms = Array.isArray(parsed.symptoms)
    ? parsed.symptoms.map((s) => String(s).trim()).filter((s) => s && s.toLowerCase() !== "none" && s.length > 2)
    : [];
  return { symptoms, emergency: Boolean(parsed.emergency) };
}

export async function handleUserMessage({ userId, consultationId, message }) {
  try {
    // Run triage and fetch history in parallel
    const [analysis, history] = await Promise.all([triage(model, message), loadHistory(consultationId)]);

    // Return emergency response if critical
    if (analysis.emergency) {
      return { response: appMessages.emergency, symptoms: analysis.symptoms };
    }

    // Invoke model directly with history and new message
    const result = await model.invoke([
      { role: "system", content: SYSTEM_PROMPT },
      ...history,
      new HumanMessage(message)
    ]);

    // Extract final response from model output
    const text = normalizeContent(result.content || "").trim() || appMessages.fallback;
    return { response: text, symptoms: analysis.symptoms };
  } catch (error) {
    console.error(`Agent error [${userId}]:`, error.message);
    throw error;
  }
}
