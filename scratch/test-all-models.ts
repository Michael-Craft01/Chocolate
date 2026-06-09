import dotenv from 'dotenv';
dotenv.config();
import { OpenAI } from 'openai';

const modelsToTest = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-flash-latest',
  'gemini-pro-latest',
  'gemini-3.5-flash'
];

async function run() {
  const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  });

  for (const model of modelsToTest) {
    try {
      console.log(`Testing model: ${model}...`);
      const response = await openai.chat.completions.create({
        model,
        messages: [{ role: 'user', content: 'Say hello' }],
      });
      console.log(`✅ Success for ${model}: ${response.choices[0]?.message?.content?.trim()}`);
    } catch (e: any) {
      console.log(`❌ Failed for ${model}: ${e.status || e.message} ${e.status === 429 ? '(Rate Limit)' : ''}`);
    }
  }
}

run();
