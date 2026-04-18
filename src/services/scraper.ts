import axios from 'axios';
import { logger } from '../lib/logger.js';
import { config } from '../config.js';

export interface ScrapedBusiness {
    name: string;
    address?: string | null;
    category?: string | null;
    website?: string | null;
    phone?: string | null;
    email?: string | null;
    description?: string | null;
}

export class Scraper {
    async scrape(query: string, country: string = 'ZW'): Promise<ScrapedBusiness[]> {
        // DRY RUN: Return mock data if enabled
        if (process.env.DRY_RUN === 'true') {
            logger.info(`[DRY RUN] Skipping actual scrape for: "${query}"`);
            return [
                {
                    name: `Mock Business ${Math.floor(Math.random() * 1000)}`,
                    website: 'https://example.com',
                    phone: country === 'ZW' ? '+263771234567' : '+27112345678',
                    category: 'Mock Category',
                    email: 'mock@example.com'
                }
            ];
        }

        try {
            logger.info(`Fetching SERP results for: "${query}" (Country: ${country})`);

            const response = await axios.post('https://google.serper.dev/search', {
                q: query,
                gl: country.toLowerCase(), // Country code
                hl: 'en', // Language
                num: 20
            }, {
                headers: {
                    'X-API-KEY': config.SERPER_API_KEY,
                    'Content-Type': 'application/json'
                }
            });

            const results: ScrapedBusiness[] = [];

            // Process organic results
            if (response.data.organic) {
                for (const item of response.data.organic) {
                    results.push({
                        name: item.title,
                        website: item.link,
                        description: item.snippet,
                        category: item.attributes?.Category || null
                    });
                }
            }

            // Process local results (Knowledge Graph / Places) if available
            if (response.data.knowledgeGraph) {
                const kg = response.data.knowledgeGraph;
                results.push({
                    name: kg.title || 'Unknown',
                    website: kg.website || null,
                    phone: kg.attributes?.Phone || null,
                    category: kg.type || null
                });
            }

            logger.info(`Extracted ${results.length} results from Serper.dev`);
            return results;

        } catch (error: any) {
            logger.error({ err: error.message }, 'Serper.dev API error:');
            return [];
        }
    }

    // Legacy method signature for compatibility
    async close() {
        return Promise.resolve();
    }
}

export const scraper = new Scraper();

