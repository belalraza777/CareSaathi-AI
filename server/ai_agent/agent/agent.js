import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createAgent } from "langchain";
import { tools } from "../tools/tools.js";
import { loadHistory, normalizeContent } from "./agentHelpers.js";
import SYSTEM_PROMPT from "./systemPrompt.js";

const DEFAULT_MODEL = "openai/gpt-oss-120b";
const IMAGE_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

export async function handleUserMessage({ userId, consultationId, message, imageFile }) {

  // Select model based on image
  const model = new ChatGroq({
    model: imageFile ? IMAGE_MODEL : DEFAULT_MODEL,
    temperature: 0.4,
    apiKey: process.env.GROQ_API_KEY,
  });
  // Create an agent with the selected model, tools, and system prompt. The agent will handle the conversation flow and generate responses based on the user's input and the context of the consultation.
  const agent = createAgent({
    model,
    tools,
    systemPrompt: SYSTEM_PROMPT,
  });

  // Load the conversation history for the given consultation ID. This history will be used to provide context to the agent, allowing it to generate more relevant and coherent responses based on previous messages in the conversation.
  const history = await loadHistory(consultationId);

  // If an image file is provided, convert it to a base64-encoded string and add it to the conversation history as part of the user's message. This allows the agent to process the image along with the text message, enabling it to generate responses that take both text and visual information into account.
  if (imageFile) {
    const base64 = imageFile.buffer.toString("base64");

    history.push(
      new HumanMessage({
        content: [
          {
            type: "text",
            text: String(message),
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${imageFile.mimetype};base64,${base64}`,
            },
          },
        ],
      })
    );
  } else {
    history.push(
      new HumanMessage(String(message))
    );
  }

  const result = await agent.invoke(
    { messages: history },
    {
      configurable: {
        userId,
        consultationId,
      },
    }
  );

  const aiMessage = result.messages
    .slice()
    .reverse()
    .find((m) => m.type === "ai");

  return normalizeContent(aiMessage?.content);
}