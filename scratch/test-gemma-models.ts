import dotenv from 'dotenv';
dotenv.config();
import { OpenAI } from 'openai';

async function testModel(modelName: string) {
  const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  });
  console.log(`Testing model: "${modelName}"...`);
  try {
    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [{ role: 'user', content: 'Say hello' }],
    });
    console.log(`✅ Success for "${modelName}":`, response.choices[0]?.message?.content);
  } catch (e: any) {
    console.error(`❌ Error with "${modelName}":`, e.message, `(status: ${e.status})`);
  }
}

async function run() {
  await testModel("gemma-4-31b-it");
  await testModel("models/gemma-4-31b-it");
  await testModel("gemma-4-26b-a4b-it");
  await testModel("models/gemma-4-26b-a4b-it");
}

run();
