import dotenv from 'dotenv';
dotenv.config();

// Bypass pooler if it's blocked by network firewall
if (process.env.DIRECT_URL) {
    process.env.DATABASE_URL = process.env.DIRECT_URL;
}

import { aiService } from '../src/services/aiService.js';

async function runFallbackTest() {
    console.log("=========================================");
    console.log("🧪 RUNNING MODEL FALLBACK VERIFICATION TEST");
    console.log("=========================================\n");

    const calls: string[] = [];

    // Intercept completions.create to mock primary failure (429) and fallback success
    (aiService as any).openai.chat.completions.create = async (options: any) => {
        const requestedModel = options.model;
        calls.push(requestedModel);
        console.log(`[MOCK API] Received completion request for model: "${requestedModel}"`);

        if (requestedModel === 'gemma-4-26b-a4b-it') {
            console.log(`[MOCK API] Simulating 429 Rate Limit error on primary model...`);
            const err = new Error('Rate limit exceeded');
            (err as any).status = 429;
            throw err;
        }

        if (requestedModel === 'gemini-3.5-flash') {
            console.log(`[MOCK API] Simulating successful completion on fallback model...`);
            return {
                choices: [
                    {
                        message: {
                            content: JSON.stringify({ refined: "Food & Beverages" })
                        }
                    }
                ]
            };
        }

        throw new Error(`Unexpected model requested in test: ${requestedModel}`);
    };

    try {
        console.log("Step 1: Calling refineInput (which runs through withRetry)...");
        const result = await aiService.refineInput("industry", "artisan restaurants");
        console.log(`\nResult returned: "${result}"`);

        console.log("\nStep 2: Checking assertions...");
        console.log(`- Attempt 1 model: "${calls[0]}"`);
        console.log(`- Attempt 2 model: "${calls[1]}"`);

        const hasPrimaryFirst = calls[0] === 'gemma-4-26b-a4b-it';
        const hasFallbackSecond = calls[1] === 'gemini-3.5-flash';
        const hasCorrectResult = result === "Food & Beverages";

        console.log(`\nVerification Check:`);
        console.log(`- Swapped from primary first?`, hasPrimaryFirst ? "✅ SUCCESS" : "❌ FAIL");
        console.log(`- Directed to fallback second?`, hasFallbackSecond ? "✅ SUCCESS" : "❌ FAIL");
        console.log(`- Received valid final result?`, hasCorrectResult ? "✅ SUCCESS" : "❌ FAIL");

        if (!hasPrimaryFirst || !hasFallbackSecond || !hasCorrectResult) {
            throw new Error("Fallback mechanism did not route models or return the output correctly!");
        }

        console.log("\n=========================================");
        console.log("✅ MODEL FALLBACK TEST PASSED");
        console.log("=========================================");
        process.exit(0);

    } catch (err: any) {
        console.error("\n❌ TEST FAILED:", err);
        process.exit(1);
    }
}

runFallbackTest();
