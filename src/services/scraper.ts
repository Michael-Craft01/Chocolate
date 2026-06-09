import { logger } from '../lib/logger.js';
import { playwrightScraper } from './playwrightScraper.js';
import { appleMapsScraper } from './appleMapsScraper.js';
import { googleSearchScraper } from './googleSearchScraper.js';
import type { ScrapedBusiness } from './playwrightScraper.js';

export type { ScrapedBusiness };

export class Scraper {
    /**
     * Scrapes businesses using the chosen platform.
     * @param query      Search query string
     * @param country    Country code (default: 'ZW')
     * @param page       Page number or depth
     * @param cardLimit  Max number of listing cards to visit per query (default: 40)
     * @param source     Platform to scrape: GOOGLE_MAPS | APPLE_MAPS | GOOGLE_SEARCH
     */
    async scrape(
        query: string, 
        country: string = 'ZW', 
        page: number = 1, 
        cardLimit: number = 40,
        source: string = 'GOOGLE_MAPS'
    ): Promise<ScrapedBusiness[]> {
        // DRY RUN: Return mock data if enabled
        if (process.env.DRY_RUN === 'true') {
            logger.info(`[DRY RUN] Skipping actual scrape for source ${source}: "${query}"`);
            return Array.from({ length: Math.min(cardLimit, 40) }, (_, i) => ({
                name: `Mock Business ${i + 1} (${source}) - ${Math.floor(Math.random() * 9000) + 1000}`,
                website: `https://mock-business-${i + 1}.example.com`,
                phone: country === 'ZW' ? `+2637712345${String(i).padStart(2, '0')}` : `+2711234${String(i).padStart(4, '0')}`,
                category: `Mock ${source} Category`,
                email: `business${i + 1}@example.com`,
                address: `Mock Address ${i + 1}, ${country}`
            }));
        }

        logger.info(`[SCRAPER] Launching scraper for source: ${source} | query: "${query}" | cardLimit: ${cardLimit}`);
        try {
            if (source === 'APPLE_MAPS') {
                return await appleMapsScraper.scrape(query, country, page, cardLimit);
            } else if (source === 'GOOGLE_SEARCH') {
                return await googleSearchScraper.scrape(query, country, page, cardLimit);
            } else {
                return await playwrightScraper.scrape(query, country, page, cardLimit);
            }
        } catch (error: any) {
            logger.error({ err: error.message, source }, '[SCRAPER] Scrape failed');
            return [];
        }
    }

    async close() {
        await Promise.all([
            playwrightScraper.close(),
            appleMapsScraper.close(),
            googleSearchScraper.close()
        ].map(p => p.catch(() => {})));
    }
}

export const scraper = new Scraper();
