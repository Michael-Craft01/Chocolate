import { playwrightScraper } from './src/services/playwrightScraper.js';
import { aiService } from './src/services/aiService.js';
import { ContactExtractor } from './src/services/contactExtractor.js';
import { logger } from './src/lib/logger.js';

const contactExtractor = new ContactExtractor();

async function testQuality() {
    const query = "fashion retail Harare";
    console.log(`\n🚀 TESTING HYPER-ROBUST MULTIMODAL EXTRACTION`);
    console.log(`Query: ${query}\n`);

    try {
        const rawResults = await playwrightScraper.scrape(query, 'ZW');
        
        console.log(`\n📊 RESULTS ANALYZED:`);
        console.log(`--------------------------------------------------`);
        
        for (const lead of rawResults.slice(0, 3)) {
            console.log(`\n🔍 PROCESSING: "${lead.name}"`);
            console.log(`WEBSITE: ${lead.website || 'No Website'}`);
            
            let visualIntel: Buffer | null = null;
            let email: string | null = null;
            
            if (lead.website) {
                console.log(`📸 Capturing Visual Intel & Contacts...`);
                const deepData = await contactExtractor.extract(lead.website);
                visualIntel = deepData.screenshot || null;
                email = deepData.email || null;
                if (email) console.log(`📧 Found Email: ${email}`);
            }

            const telemetry = `Email: ${email || 'Hidden'} | Source: ${lead.category || 'Organic'}`;
            
            const enrichment = await aiService.enrichLead(lead.name, 'Fashion Boutique', {
                productDescription: "Creative Branding & Visual Marketing",
                targetPainPoints: "Inconsistent social presence, outdated website aesthetic, or poor digital engagement"
            }, telemetry, visualIntel);
            
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
