import 'dotenv/config'
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_KEY});

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
          { role: "system", content: "You generate concise, smart debate motions." },
          { role: "user", content: `Generate only a motion for a hard level world school debate on: economics. NOTHING ELSE. Only provide plain text, avoid extra Markdown, HTML or <think> tags.` }
        ]
  });
  console.log(response.text);
}

await main();