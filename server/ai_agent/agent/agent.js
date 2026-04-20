import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createAgent } from "langchain";
import { tools } from "../tools/tools.js";
import { loadHistory, normalizeContent, buildIntakeContextMessage } from "./agentHelpers.js"; // Pull in output normalizer used after agent invoke.
import SYSTEM_PROMPT from "./systemPrompt.js"; // systemPrompt.js exports default, not named.


const model = new ChatGroq({
  model: "openai/gpt-oss-120b", //other backup models: "llama-3.3-70b-versatile", "openai/gpt-oss-20b", 
  temperature: 0.4,
  apiKey: process.env.GROQ_API_KEY,
});

export const llm = model; // Named export for tools that need direct model access.


// Shared agent — tools resolve userId from config at runtime.
const agent = createAgent({
  model,
  tools,
  systemPrompt: SYSTEM_PROMPT,
});


export async function handleUserMessage({ userId, consultationId, message }) {
  try {
    // Load consultation to ensure it exists and belongs to user
    const history = await loadHistory(consultationId);
    const intakeContext = await buildIntakeContextMessage({ userId, consultationId });
    if (intakeContext) {
      history.unshift(new SystemMessage(intakeContext));
    }
    history.push(new HumanMessage(String(message ?? "")));

    // Invoke agent with conversation history and config for tools
    const result = await agent.invoke(
      { messages: history },
      { configurable: { userId, consultationId } }
    );

    // Get latest AI message safely
    const latestAiMessage = result?.messages
      ?.slice()
      ?.reverse()
      ?.find((m) => m?.type === "ai" || m?._getType?.() === "ai");

    // Extract proper text
    const finalResponse = normalizeContent(
      latestAiMessage?.content ?? result?.content
    );
    
    return finalResponse || "Sorry, I couldn't process that. Please try again.";

  } catch (err) {
    console.error("Error:", err?.message || err);
    throw err;
  }
}

export default {
  handleUserMessage,
  model,
};