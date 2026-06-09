import dotenv from 'dotenv';
// Load frontend env specifically
dotenv.config({ path: 'frontend/.env.local' });

// We must mock next/headers cookies if they are imported anywhere, but they are only in api-auth.ts
// Let's import the frontend aiService
import { aiService } from '../frontend/src/lib/ai-service';

async function testFrontendRefine() {
  console.log("Testing frontend aiService.refineInput directly...");
  try {
    const refined = await aiService.refineInput("industry", "artisan bakery");
    console.log("Refinement Result:", JSON.stringify(refined));
  } catch (error: any) {
    console.error("Test failed with error:", error);
  }
}

testFrontendRefine();
