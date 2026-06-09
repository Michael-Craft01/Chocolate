import dotenv from 'dotenv';
dotenv.config();

import { aiService } from '../src/services/aiService.js';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function testPipeline() {
    console.log("=========================================");
    console.log("🧪 TESTING TARGET MARKET PIPELINE");
    console.log("================================*********\n");

    // 1. Test AI Sourcing Classification
    console.log("--- 1. Testing AI Campaign Source Classification ---");
    const testMarkets = [
        {
            market: "Cozy local cafes and bakeries in Harare looking for inventory software",
            desc: "POS software with inventory tracking"
        },
        {
            market: "SaaS startups and digital marketing agencies in South Africa looking to automate client acquisition",
            desc: "B2B lead generation engine"
        },
        {
            market: "Local dental clinics and healthcare practitioners in Harare",
            desc: "Patient appointment scheduling and reminders tool"
        }
    ];

    for (const test of testMarkets) {
        console.log(`\nMarket: "${test.market}"`);
        try {
            const sources = await aiService.classifyCampaignSources(test.market, test.desc);
            console.log(`Resulting Sources:`, JSON.stringify(sources));
        } catch (e: any) {
            console.error(`Classification failed:`, e.message);
        }
        await sleep(5000); // 5s delay between API requests
    }

    // 2. Test AI Query Generation
    console.log("\n--- 2. Testing AI Query Generation ---");
    try {
        const queries = await aiService.generateQueriesFromTargetMarket(
            "Boutique hotels and lodges near Victoria Falls needing booking systems",
            ["Victoria Falls", "Harare"],
            ["Hotels", "Hospitality"],
            "SMALL",
            5
        );
        console.log(`Generated Queries:`, JSON.stringify(queries, null, 2));
    } catch (e: any) {
        console.error(`Query generation failed:`, e.message);
    }
    await sleep(5000);

    // 3. Test AI Size Enrichment
    console.log("\n--- 3. Testing AI Business Size Enrichment ---");
    const testLeads = [
        {
            name: "Vanguard Tech Solutions",
            sector: "Software Engineering",
            telemetry: "Harare | https://vanguardtech.co.zw | Contact status: contactable | Best channel: email | Evidence: email, website. Context: We are an enterprise software vendor with 120 employees across 3 office branches in Harare, Bulawayo and Gweru, offering custom cloud infrastructure."
        },
        {
            name: "Avondale Sweet Treat Cafe",
            sector: "Bakery & Coffee Shop",
            telemetry: "Avondale, Harare | https://sweet-treats.co.zw | Contact status: contactable | Best channel: phone | Evidence: phone. Context: Avondale Sweet Treat Cafe is a cozy local neighborhood corner bakery and espresso spot operated by 4 local staff members."
        }
    ];

    for (const lead of testLeads) {
        console.log(`\nLead: "${lead.name}" (${lead.sector})`);
        try {
            const enrichment = await aiService.enrichLead(
                lead.name,
                lead.sector,
                { productDescription: "Takada Leads Automation POS System", targetPainPoints: "inefficient local outreach" },
                lead.telemetry
            );
            console.log(`Brand Name: "${enrichment.brandName}"`);
            console.log(`Pain Point: "${enrichment.painPoint}"`);
            console.log(`Qualified Size: "${enrichment.companySize}"`);
        } catch (e: any) {
            console.error(`Enrichment failed:`, e.message);
        }
        await sleep(5000);
    }

    console.log("\n=========================================");
    console.log("🧪 TESTING PIPELINE COMPLETE");
    console.log("=========================================");
}

testPipeline();
