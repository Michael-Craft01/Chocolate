import dotenv from 'dotenv';
dotenv.config();

// Bypass pooler if it's blocked by network firewall
if (process.env.DIRECT_URL) {
    process.env.DATABASE_URL = process.env.DIRECT_URL;
}

// Enable dry run so playwright isn't launched and mock results are returned
process.env.DRY_RUN = 'true';

import prisma from '../src/lib/prisma.js';
import { aiService } from '../src/services/aiService.js';
import { queryGenerator } from '../src/services/queryGenerator.js';
import { processLeadsForQuery } from '../src/services/discoveryEngine.js';

// ── Mock AI Methods to avoid rate limits ──
aiService.classifyCampaignSources = async (targetMarket, desc) => {
    console.log(`[MOCK AI] classifyCampaignSources called for: "${targetMarket}"`);
    return ['GOOGLE_MAPS', 'APPLE_MAPS'];
};

aiService.generateQueriesFromTargetMarket = async (targetMarket, locations, industries, size, count) => {
    console.log(`[MOCK AI] generateQueriesFromTargetMarket called!`);
    return [
        { query: "boutique cafe harare", location: "Harare", industry: "Cafes" },
        { query: "vanguard technology solutions", location: "Harare", industry: "Technology" }
    ];
};

aiService.enrichLead = async (businessName, category, config, telemetry, image) => {
    console.log(`[MOCK AI] enrichLead called for business: "${businessName}"`);
    // Let's qualify Vanguard as "Large" and others as "Small"
    const companySize = businessName.toLowerCase().includes('vanguard') ? 'Large' : 'Small';
    return {
        brandName: businessName,
        industry: category || 'SME',
        painPoint: 'Operational friction resolved by Takada POS',
        recommendedSolution: config?.productDescription || 'POS software',
        score: 9.5,
        companySize
    };
};

aiService.generatePersonalizedMessage = async (campaign, businessName, industry, painPoint) => {
    console.log(`[MOCK AI] generatePersonalizedMessage called for business: "${businessName}"`);
    return `Hi ${businessName}, we saw you are in ${industry} dealing with ${painPoint}. Try ${campaign.productName}.`;
};

async function runRoutingTest() {
    console.log("=========================================");
    console.log("🧪 RUNNING ROUTING & SIZE FILTERING TEST");
    console.log("=========================================\n");

    try {
        // Find or create a test user
        let user = await prisma.user.findFirst({
            where: { email: 'test-routing-pipeline@example.com' }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    id: 'usr_test_pipeline_' + Math.random().toString(36).substring(2, 10),
                    email: 'test-routing-pipeline@example.com',
                    tier: 'ELITE', 
                    dailyLimit: 100,
                    creditBalance: 100,
                    cyclesRemaining: 10,
                    paymentStatus: 'active'
                }
            });
            console.log(`Created test user: ${user.id}`);
        } else {
            // Reset dailyLimit and cyclesRemaining
            user = await prisma.user.update({
                where: { id: user.id },
                data: { dailyLimit: 100, creditBalance: 100, cyclesRemaining: 10 }
            });
        }

        // Create campaign targeting "SMALL" businesses
        const campaign = await prisma.campaign.create({
            data: {
                userId: user.id,
                name: 'Small Cafe Campaign ' + Math.random().toString(36).substring(2, 6),
                status: 'ACTIVE',
                senderName: 'Mike',
                senderRole: 'CTO',
                companyName: 'LogicHQ',
                productName: 'Takada POS',
                productDescription: 'High trust B2B POS software',
                targetPainPoints: 'stock leaks',
                targetCountry: 'ZW',
                locations: ['Harare'],
                industries: ['Cafes', 'Technology'],
                targetMarket: 'Small local artisan cafes in Harare',
                targetBusinessSize: 'SMALL', // <-- TARGET BUSINESS SIZE IS SMALL
                assignedSources: ['GOOGLE_MAPS', 'APPLE_MAPS']
            }
        });

        console.log(`Created campaign: ${campaign.id} | targetBusinessSize: ${campaign.targetBusinessSize}\n`);

        // 1. Test Query Generator routing
        console.log("Step 1: Running Query Generator...");
        const queries = await queryGenerator.generateBatchQueries(5, campaign);
        console.log(`Queries generated:`, JSON.stringify(queries, null, 2));

        if (queries.length === 0) {
            throw new Error("No queries generated!");
        }

        // 2. Mock scraper output for test run to simulate "Vanguard" (Large) and "Avondale Cafe" (Small)
        // Since process.env.DRY_RUN = 'true', our mock scraper inside scraper.ts returns Mock Businesses.
        // Let's temporarily override the scraper.scrape method in our test to return a controlled set of businesses!
        const { scraper } = await import('../src/services/scraper.js');
        scraper.scrape = async (query, country, page, cardLimit, source) => {
            console.log(`[MOCK SCRAPER] scrape called for source: ${source} | query: "${query}"`);
            return [
                {
                    name: 'Vanguard Enterprise Solutions',
                    website: 'https://vanguard-ent.co.zw',
                    phone: '+263772111111',
                    category: 'Technology',
                    email: 'sales@vanguard-ent.co.zw'
                },
                {
                    name: 'Avondale Sweet Treats Cafe',
                    website: 'https://sweet-treats.co.zw',
                    phone: '+263773222222',
                    category: 'Cafes',
                    email: 'hello@sweet-treats.co.zw'
                }
            ];
        };

        // 3. Run Query Processing cycle
        console.log("\nStep 2: Processing query cycle and applying size qualification/discard filters...");
        const sweepDate = new Date();
        const sweepId = 'swp_test_' + Math.random().toString(36).substring(2, 6);

        // Run processLeadsForQuery on the first query
        const count = await processLeadsForQuery(
            campaign,
            queries[0],
            10,
            sweepId,
            sweepDate
        );

        console.log(`\nProcessed cycle completed. Leads synced to DB count: ${count}`);

        // 4. Verification in Database
        console.log("\nStep 3: Verifying DB state...");
        const leads = await prisma.lead.findMany({
            where: { campaignId: campaign.id },
            include: { business: true }
        });

        console.log(`Total Leads found in DB for this campaign: ${leads.length}`);
        for (const lead of leads) {
            console.log(`Lead Business Name: "${lead.business.name}"`);
            console.log(`Lead Business Size: "${lead.business.companySize}"`);
        }

        // We expect Vanguard Enterprise Solutions (Large) to be SILENTLY DISCARDED,
        // and only Avondale Sweet Treats Cafe (Small) to be SAVED to the DB!
        const hasLarge = leads.some(l => l.business.name.includes('Vanguard'));
        const hasSmall = leads.some(l => l.business.name.includes('Avondale'));

        console.log(`\nVerification Check:`);
        console.log(`- Vanguard Enterprise (Large) saved?`, hasLarge ? "❌ FAIL (should be discarded)" : "✅ SUCCESS (discarded)");
        console.log(`- Avondale Sweet Treats (Small) saved?`, hasSmall ? "✅ SUCCESS" : "❌ FAIL (should be saved)");

        if (hasLarge || !hasSmall) {
            throw new Error("Silent discard filter failed to qualify and filter business sizes correctly!");
        }

        // Cleanup
        console.log("\nCleaning up test campaign...");
        await prisma.campaign.delete({ where: { id: campaign.id } });
        console.log("Cleanup complete.");

        console.log("\n=========================================");
        console.log("✅ INTEGRATION ROUTING TEST PASSED");
        console.log("=========================================");

    } catch (err: any) {
        console.error("\n❌ TEST FAILED:", err);
    }
}

runRoutingTest();
