import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../src/config.js';

async function main() {
  const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
  console.log("Using model:", config.GEMINI_MODEL);
  
  const model = genAI.getGenerativeModel({
    model: config.GEMINI_MODEL,
    systemInstruction: "You are a professional B2B assistant. Your job is to refine user inputs into professional descriptions. Return ONLY a valid JSON object matching the requested schema. Do NOT output any reasoning, drafts, markdown, or other text.",
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json"
    }
  });

  const prompt = `Refine this input: "point of sale offline" for the product "LogicHQ". Return a JSON object with the key "refined".`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log("Raw Response:");
    console.log(text);
    console.log("Parsed:", JSON.parse(text));
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
