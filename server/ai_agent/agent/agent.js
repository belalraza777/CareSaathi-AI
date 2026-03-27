import "dotenv/config";
import mongoose from "mongoose";
import { ChatGroq } from "@langchain/groq";
import { HumanMessage } from "@langchain/core/messages";
import Consultation from "../../models/consultationModel.js";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tools } from "../tools/tools.js";
import { loadHistory, normalizeContent } from "./agentHelpers.js"; // Pull in output normalizer used after agent invoke.
import SYSTEM_PROMPT from "./systemPrompt.js"; // systemPrompt.js exports default, not named.


const model = new ChatGroq({
  model: "llama-3.1-8b-instant",
  temperature: 0.3,
  apiKey: process.env.GROQ_API_KEY,
});

export const llm = model; // Named export for tools that need direct model access.

// Shared ReAct agent — tools resolve userId from config at runtime
const agent = createReactAgent({
  llm: model,
  tools,
  stateModifier: SYSTEM_PROMPT,
});


export async function handleUserMessage({ userId, consultationId, message }) {
  try {
    // Load consultation to ensure it exists and belongs to user
    const history = await loadHistory(consultationId);
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