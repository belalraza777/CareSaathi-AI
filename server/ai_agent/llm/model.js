import dotenv from 'dotenv';
dotenv.config();

import { ChatGroq } from "@langchain/groq";

// Grok (Llama) model configuration with optimized temperature for medical context.
export const llm = new ChatGroq({
  model: "llama-3.1-8b-instant",
  temperature: 0.3,
  apiKey: process.env.GROQ_API_KEY,
});
