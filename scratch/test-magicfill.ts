import dotenv from 'dotenv';
dotenv.config();

import { aiService } from '../src/services/aiService.js';

async function testRefine() {
    try {
        console.log("Testing refineInput using default...");
        const resDefault = await aiService.refineInput("industry", "artisan bakery");
        console.log("Default result:", resDefault);

        console.log("\nTesting refineInput using gemma-3-27b-it directly...");
        // Let's modify the service configuration to use gemma-3-27b-it as the model
        (aiService as any).model = "gemma-3-27b-it";
        const resGemma = await aiService.refineInput("industry", "artisan bakery");
        console.log("Gemma result:", resGemma);
    } catch (e: any) {
        console.error("Refine test failed:", e);
    }
}

testRefine();
