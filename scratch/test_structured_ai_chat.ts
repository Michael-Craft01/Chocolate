import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../src/config.js';

async function main() {
  const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
  console.log("Using model:", config.GEMINI_MODEL);
  
  const model = genAI.getGenerativeModel({
    model: config.GEMINI_MODEL,
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json"
    }
  });

  const prompt = `<start_of_turn>user
You are a professional B2B assistant.
Refine the following input into a professional description.
Input: "point of sale offline"
Product: LogicHQ

Return a JSON object in this exact format:
{
  "refined": "your professional description here"
}
<end_of_turn>
<start_of_turn>model
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log("Raw Response:");
    console.log(text);
    console.log("Parsed:", JSON.parse(text));
  } catch (error) {
    console.error("Structured output error:", error);
  }
}

main();
