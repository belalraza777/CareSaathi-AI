import "dotenv/config";

// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// import { ChatOpenAI } from "@langchain/openai";
import { ChatGroq } from "@langchain/groq";

// /**
//  * Gemini model
//  * Handles:
//  * - Text
//  * - Images
//  * - Tool Calling
//  * - Long Context
//  */
// export const model = new ChatGoogleGenerativeAI({
//   model: "gemini-3.5-flash",
//   apiKey: process.env.GOOGLE_API_KEY,
//   temperature: 0.2,
//   maxOutputTokens: 1024,
// });


export const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "qwen/qwen3.6-27b",
  temperature: 0.2,
  maxTokens: 1024,
});

//meta-llama/llama-4-maverick-17b-128e-instruct
//meta-llama/llama-4-scout-17b-16e-instruct
//qwen/qwen3.6-27b
