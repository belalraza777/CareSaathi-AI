import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function test() {
  try {
    console.log("API Key:", process.env.GOOGLE_API_KEY?.slice(0, 10) + "...");

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    // List available models
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_API_KEY}`
    );

    const data = await res.json();

    console.log(
      "\nAvailable Models:\n",
      data.models?.map((m) => m.name)
    );

   const model = genAI.getGenerativeModel({
  model: "models/gemini-2.5-flash",
});

    console.log("\nGenerating...\n");

    const result = await model.generateContent(
      "Say only: Hello from Gemini!"
    );

    console.log("Response:");
    console.log(result.response.text());
  } catch (err) {
    console.error("\nERROR:");
    console.error(err);
  }
}

test();