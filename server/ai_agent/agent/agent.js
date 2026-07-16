import "dotenv/config";
import { HumanMessage } from "@langchain/core/messages";
import { createAgent } from "langchain";
import { tools } from "../tools/tools.js";
import { loadHistory, normalizeContent } from "./agentHelpers.js";
import SYSTEM_PROMPT from "./systemPrompt.js";
import { model } from "./llm.js";


/**
 * Create the agent once.
 */
export const agent = createAgent({
  model,
  tools,
  systemPrompt: SYSTEM_PROMPT,
});

/**
 * Handles a user's message.
 */
export async function handleUserMessage({
  userId,
  consultationId,
  message,
  imageFile,
}) {
  try {
    // Load previous conversation
    const history = await loadHistory(consultationId);

    // User sent an image
    if (imageFile) {  // Convert image to base64
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
      history.push(new HumanMessage(String(message)));
    }

    // Invoke the agent
    const result = await agent.invoke(
      {
        messages: history,
      },
      {
        configurable: {
          userId,
          consultationId,
        },
      }
    );

    // Find last AI response
    const aiMessage = [...result.messages]
      .reverse()
      .find((message) => message.type === "ai");

    return normalizeContent(aiMessage?.content);
  } catch (error) {
    console.error("Gemini Agent Error:", error);

    return "I'm sorry, something went wrong while processing your request. Please try again.";
  }
}