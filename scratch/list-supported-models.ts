import dotenv from 'dotenv';
dotenv.config();
import { OpenAI } from 'openai';

async function listModels() {
    const openai = new OpenAI({
        apiKey: process.env.GEMINI_API_KEY,
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    });
    try {
        console.log("Fetching models list from Google API...");
        const response = await openai.models.list();
        console.log("Supported Models:");
        for (const model of response.data) {
            console.log(`- ${model.id}`);
        }
    } catch (e: any) {
        console.error("Failed to list models:", e.message);
    }
}

listModels();
