// Quick test: verifies that Gemma 4 returns elaborated text without response_format json_object
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
});

async function testElaborate() {
  console.log('Testing Elaborate with model: gemma-3-27b-it');
  console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
  
  const systemPrompt = 'You are the HyprLead AI Assistant. ' +
    'The user has typed a short or rough input. Elaborate it into a detailed, professional, persuasive description ' +
    'optimised for B2B lead outreach and discovery. Expand vague language, add specifics, and make it compelling. ' +
    "Maintain the user's original intent and tone — just make it richer and more complete. " +
    'Return ONLY a valid JSON object with a single key "refined" containing the elaborated value (plain text, no markdown). ' +
    'Do NOT output any reasoning, thoughts, drafts, or markdown.';

  const userInput = 'We sell POS systems to shops';
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gemma-3-27b-it',
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `FIELD: "Value Proposition"\nUSER INPUT: "${userInput}"\nCONTEXT: {}\n\nElaborate the user's input for this field into a high-quality, detailed version.`
        },
      ],
      // No response_format: { type: 'json_object' } — not supported by Gemma
      temperature: 0.4,
      max_tokens: 2000, // MUST be large enough for the <thought> block + JSON output
    });

    const raw = response.choices[0]?.message?.content ?? '';
    console.log('\n--- RAW MODEL RESPONSE (first 300 chars) ---');
    console.log(raw.slice(0, 300) + '...');
    console.log('--------------------------------------------\n');

    // Strip thinking tags FIRST, then extract JSON
    const cleanText = raw
      .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
      .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
      .trim();

    const jsonStart = cleanText.indexOf('{');
    const jsonEnd = cleanText.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      try {
        const parsed = JSON.parse(cleanText.substring(jsonStart, jsonEnd + 1));
        if (parsed.refined) {
          console.log('✅ SUCCESS — Elaborated text:');
          console.log(parsed.refined);
        } else {
          console.log('⚠️ JSON parsed but no "refined" key. Full object:', parsed);
        }
      } catch (e) {
        console.error('❌ JSON parse failed. Clean text:', cleanText.slice(0, 400));
      }
    } else {
      // Model returned plain text, use it
      if (cleanText) {
        console.log('✅ SUCCESS (plain text) — Elaborated text:');
        console.log(cleanText);
      } else {
        console.error('❌ No content in response');
      }
    }
  } catch (err: any) {
    console.error('❌ API ERROR:', err.message);
    console.error('Status:', err.status);
  }
}

testElaborate();
