import dotenv from 'dotenv';
dotenv.config();

import { aiService } from '../src/services/aiService';

async function testAI() {
    try {
        console.log("Testing generation of outreach message...");
        const campaign = {
            productName: "Takada POS",
            senderName: "Mike",
            companyName: "LogicHQ",
            ctaLink: "https://takada.logichq.tech",
            productDescription: "Streamlined inventory management & mobile POS, real-time control, reduced costs."
        };
        const message = await aiService.generatePersonalizedMessage(
            campaign,
            "Cuisson Ingredients",
            "Baking Supplies Retail",
            "Inefficient inventory tracking of diverse baking ingredients and tools, leading to frequent stockouts of critical items and lost revenue."
        );
        console.log("\n=================== GENERATED MESSAGE ===================");
        console.log(message);
        console.log("=========================================================");
    } catch (e: any) {
        console.error("Test failed:", e);
    }
}

testAI();
