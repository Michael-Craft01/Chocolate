import dotenv from 'dotenv';
dotenv.config({ path: 'frontend/.env.local' });

async function run() {
  console.log("Loading frontend/src/lib/ai-service...");
  try {
    const mod = await import('../frontend/src/lib/ai-service');
    console.log("Exported keys:", Object.keys(mod));
    const aiService = mod.aiService;
    if (!aiService) {
      console.error("aiService is undefined in module!");
      return;
    }
    const res = await aiService.refineInput("industry", "artisan bakery");
    console.log("Refinement Result:", JSON.stringify(res));
  } catch (error: any) {
    console.error("Error during execution:", error);
  }
}

run();
