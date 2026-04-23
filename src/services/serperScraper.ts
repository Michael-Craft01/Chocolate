import axios from 'axios';
import { config } from '../config.js';
import { logger } from '../lib/logger.js';
import type { ScrapedBusiness } from './playwrightScraper.js';

export class SerperScraper {
    async scrape(query: string, country: string = 'ZW'): Promise<ScrapedBusiness[]> {
        if (!config.SERPER_API_KEY) {
            logger.warn('No SERPER_API_KEY found, skipping high-reliability search');
            return [];
        }

        try {
            logger.info(`[SERPER] Searching via API for: "${query}"...`);
            
            const data = JSON.stringify({
                "q": query,
                "gl": country.toLowerCase(),
                "hl": "en",
                "num": 20
            });

            const response = await axios.post('https://google.serper.dev/search', data, {
                headers: { 
                    'X-API-KEY': config.SERPER_API_KEY, 
                    'Content-Type': 'application/json'
                }
            });

            const results: ScrapedBusiness[] = [];
            
            const JUNK_KEYWORDS = [
                'how to', 'best', 'top', 'guide', 'list', 'review', 'blog', 
                'tips', 'cheap', 'free', 'online', 'directory', 'companies in',
                'news', 'article', 'find', 'buy', 'shop', 'deals', 'discount'
            ];

            // 1. Process Organic Results
            if (response.data.organic) {
                response.data.organic.forEach((item: any) => {
                    const name = item.title.split(' - ')[0].split(' | ')[0].split(' : ')[0].trim();
                    const lowerName = name.toLowerCase();
                    const isJunk = JUNK_KEYWORDS.some(k => lowerName.includes(k));
                    const hasPunctuation = /[:\?\!\n]/.test(name);

                    if (name.length > 3 && name.length < 50 && !isJunk && !hasPunctuation) {
                        const snippet = item.snippet || '';
                        const phoneMatch = snippet.match(/(\+263|077|078|071)\s?\d{7,}/g);
                        const emailMatch = snippet.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);

                        results.push({
                            name,
                            website: item.link,
                            phone: phoneMatch ? phoneMatch[0] : null,
                            email: emailMatch ? emailMatch[0] : null,
                            category: 'Serper Organic',
                            address: snippet 
                        });
                    }
                });
            }

            // 2. Process Places (Maps) - HIGH QUALITY
            if (response.data.places) {
                response.data.places.forEach((item: any) => {
                    results.push({
                        name: item.title,
                        website: item.website,
                        phone: item.phoneNumber,
                        address: `${item.address || ''} (Rating: ${item.rating || 'N/A'}, Reviews: ${item.ratingCount || 0})`,
                        category: 'Serper Local'
                    });
                });
            }

            logger.info(`[SERPER] Found ${results.length} leads via API`);
            return results;
        } catch (error: any) {
            logger.error(`[SERPER] API failure: ${error.message}`);
            return [];
        }
    }
}

export const serperScraper = new SerperScraper();
