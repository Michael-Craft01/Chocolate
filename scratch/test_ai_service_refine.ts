import dotenv from 'dotenv';
dotenv.config();

import { aiService } from '../src/services/aiService.js';

async function main() {
  console.log("Testing aiService.refineInput directly...");
  try {
    const field = "productDescription";
    const value = "point of sale offline";
    const context = { productName: "LogicHQ" };
    
    const refined = await aiService.refineInput(field, value, context);
    console.log("\n=================== REFINED OUTPUT ===================");
    console.log(refined);
    console.log("======================================================");
    
    if (refined.includes('*') || refined.includes('Draft') || refined.includes('refined":') || refined.includes('{')) {
      console.error("❌ Test failed: Preambles, thoughts, or JSON structures leaked into output!");
    } else {
      console.log("✅ Test passed: Clean string output with no leaks!");
    }
  } catch (error) {
    console.error("Refinement failed:", error);
  }
}

main();
