import { chromium, Browser, Page } from 'playwright';
import { logger } from '../lib/logger.js';

export interface ScrapedBusiness {
    name: string;
    website?: string | null;
    phone?: string | null;
    category?: string | null;
    address?: string | null;
}

export class PlaywrightScraper {
    private browser: Browser | null = null;

    async init() {
        if (!this.browser) {
            this.browser = await chromium.launch({ 
                headless: true, // Set to false if you want to watch it work!
                args: [
                    '--no-sandbox', 
                    '--disable-setuid-sandbox',
                    '--disable-blink-features=AutomationControlled' // Stealth
                ]
            });
        }
    }

    async scrape(query: string, country: string = 'ZW'): Promise<ScrapedBusiness[]> {
        await this.init();
        
        // Create a stealthy context
        const context = await this.browser!.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport: { width: 1280, height: 720 }
        });
        
        const page = await context.newPage();
        const results: ScrapedBusiness[] = [];
        
        try {
            logger.info(`[BROWSER] Navigating for: "${query}" in ${country}`);
            
            // Source 1: Bing (Very reliable for local ZW/SA businesses)
            const bingUrl = `https://www.bing.com/search?q=${encodeURIComponent(query + ' in ' + country)}`;
            await page.goto(bingUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await page.waitForTimeout(1000 + Math.random() * 2000); // Random delay

            // Extract results from Bing
            const bingResults = await page.$$eval('li.b_algo', (elements) => {
                return elements.map(el => {
                    const titleEl = el.querySelector('h2 a');
                    const snippetEl = el.querySelector('.b_caption p, .b_snippet');
                    return {
                        name: titleEl ? (titleEl as HTMLElement).innerText : '',
                        website: titleEl ? (titleEl as HTMLAnchorElement).href : '',
                        snippet: snippetEl ? (snippetEl as HTMLElement).innerText : ''
                    };
                }).filter(r => r.name && r.website && !r.website.includes('bing.com'));
            });

            for (const r of bingResults) {
                // Try to extract phone from snippet using regex
                const phoneMatch = r.snippet.match(/(\+?\d[\d\s-]{7,}\d)/);
                
                results.push({
                    name: r.name,
                    website: r.website,
                    phone: phoneMatch ? phoneMatch[0] : null,
                    category: 'Web Discovery'
                });
            }

            // If we have very few results, try DuckDuckGo as backup
            if (results.length < 3) {
                logger.info(`[BROWSER] Low results, trying DuckDuckGo fallback...`);
                const ddgUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query + ' ' + country)}`;
                await page.goto(ddgUrl, { waitUntil: 'domcontentloaded' });
                await page.waitForTimeout(2000);
                
                const ddgLinks = await page.$$eval('article[data-testid="result"]', (elements) => {
                    return elements.map(el => {
                        const link = el.querySelector('a[data-testid="result-title-a"]');
                        return {
                            name: link ? (link as HTMLElement).innerText : '',
                            website: link ? (link as HTMLAnchorElement).href : ''
                        };
                    }).filter(r => r.name && r.website).slice(0, 5);
                });

                for (const r of ddgLinks) {
                    if (!results.some(existing => existing.website === r.website)) {
                        results.push({ ...r, category: 'Web Discovery' });
                    }
                }
            }

            logger.info(`[BROWSER] Successfully extracted ${results.length} leads for analysis.`);
            
        } catch (err: any) {
            logger.error({ err: err.message }, '[BROWSER] Error during automated hunt');
        } finally {
            await context.close();
        }

        return results;
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}

export const playwrightScraper = new PlaywrightScraper();
