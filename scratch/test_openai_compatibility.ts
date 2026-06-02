import dotenv from 'dotenv';
dotenv.config();

import OpenAI from 'openai';
import { config } from '../src/config.js';

async function main() {
  console.log("Using API Key:", config.GEMINI_API_KEY ? "Present" : "Missing");
  console.log("Using model via OpenAI compatibility API:", config.GEMINI_MODEL);

  const openai = new OpenAI({
    apiKey: config.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
  });

  try {
    const response = await openai.chat.completions.create({
      model: config.GEMINI_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a professional B2B assistant. Your job is to refine user inputs into professional descriptions. Return ONLY a valid JSON object with the key 'refined'. Do NOT output any thinking, drafts, or markdown."
        },
        {
          role: "user",
          content: "Refine this input: \"point of sale offline\" for the product \"LogicHQ\"."
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1
    });

    const final_output = response.choices[0].message.content;
    console.log("final_output:", final_output);
    if (final_output) {
      console.log("Parsed:", JSON.parse(final_output));
    }
  } catch (error) {
    console.error("OpenAI compatibility call failed:", error);
  }
}

main();
