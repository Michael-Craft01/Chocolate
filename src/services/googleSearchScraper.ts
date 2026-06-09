import { chromium } from 'playwright-extra';
// @ts-ignore
import stealth from 'puppeteer-extra-plugin-stealth';
import { Browser } from 'playwright';
import { logger } from '../lib/logger.js';
import type { ScrapedBusiness } from './playwrightScraper.js';

chromium.use(stealth());

export class GoogleSearchScraper {
    private browser: Browser | null = null;

    async init() {
        if (this.browser && !this.browser.isConnected()) {
            this.browser = null;
        }
        if (!this.browser) {
            this.browser = await chromium.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-blink-features=AutomationControlled',
                    '--window-size=1920,1080',
                    '--disable-gpu',
                ],
            });
        }
    }

    async scrape(query: string, country: string = 'ZW', page: number = 1, cardLimit: number = 20): Promise<ScrapedBusiness[]> {
        await this.init();

        const context = await this.browser!.newContext({
            locale: 'en-US',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            viewport: { width: 1920, height: 1080 },
        });

        const p = await context.newPage();
        await p.route('**/*.{png,jpg,jpeg,gif,svg,woff,woff2,ttf,otf,css}', route => route.abort());

        const results: ScrapedBusiness[] = [];

        try {
            logger.info(`[GOOGLE_SEARCH] Scrape started for query: "${query}" | limit: ${cardLimit}`);
            
            const delay = 3000 + Math.floor(Math.random() * 4000);
            await p.waitForTimeout(delay);

            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query + ' ' + country)}`;
            await p.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

            // Wait for results
            await p.waitForSelector('h3', { timeout: 15000 }).catch(() => {});

            // Extract organic links
            const rawLinks = await p.evaluate(() => {
                const links: Array<{ name: string; website: string }> = [];
                const organicElements = document.querySelectorAll('div.g, div.MjjYud');
                
                organicElements.forEach(el => {
                    const a = el.querySelector('a');
                    const h3 = el.querySelector('h3');
                    if (a && h3) {
                        const href = a.href;
                        const name = h3.textContent || '';
                        if (href && href.startsWith('http') && !href.includes('google.com')) {
                            links.push({
                                name: name.trim(),
                                website: href
                            });
                        }
                    }
                });

                return links;
            });

            // Deduplicate websites
            const seenWebsites = new Set<string>();
            const uniqueLinks = rawLinks.filter(item => {
                try {
                    const host = new URL(item.website).hostname.replace('www.', '');
                    if (seenWebsites.has(host)) return false;
                    seenWebsites.add(host);
                    return true;
                } catch {
                    return false;
                }
            });

            const targets = uniqueLinks.slice(0, cardLimit);
            logger.info(`[GOOGLE_SEARCH] Found ${targets.length} unique organic websites to return.`);

            for (const target of targets) {
                // Clean up title (remove trailing parts like " - Wikipedia", " | Cafe", etc.)
                let name = target.name;
                name = name.replace(/\s*[|-]\s*.*$/, '');
                
                results.push({
                    name: name || 'Business Profile',
                    website: target.website,
                    phone: null,
                    address: null,
                    category: 'Google Search Organic'
                });
            }

        } catch (err: any) {
            logger.error({ err }, '[GOOGLE_SEARCH] Scraping session crashed');
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

export const googleSearchScraper = new GoogleSearchScraper();
