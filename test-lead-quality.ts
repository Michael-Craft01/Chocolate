import { playwrightScraper } from './src/services/playwrightScraper.js';
import { aiService } from './src/services/aiService.js';
import { logger } from './src/lib/logger.js';

async function testQuality() {
    const query = "fashion retail Harare";
    console.log(`\n🚀 TESTING HIGH-FIDELITY EXTRACTION`);
    console.log(`Query: ${query}\n`);

    try {
        const rawResults = await playwrightScraper.scrape(query, 'ZW');
        
        console.log(`\n📊 RESULTS ANALYZED:`);
        console.log(`--------------------------------------------------`);
        
        for (const lead of rawResults) {
            console.log(`\nRAW SCRAPED NAME: "${lead.name}"`);
            console.log(`WEBSITE: ${lead.website}`);
            
            const enrichment = await aiService.enrichLead(lead.name, 'Boutique', {
                productDescription: "HyprLead AI",
                targetPainPoints: null // Let AI detect naturally
            });
            
            console.log(`✅ CLEANED BRAND NAME: "${enrichment.brandName}"`);
            console.log(`INDUSTRY: ${enrichment.industry}`);
            console.log(`PAIN POINT: ${enrichment.painPoint}`);
            console.log(`--------------------------------------------------`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error("Test failed:", error);
        process.exit(1);
    }
}

testQuality();
