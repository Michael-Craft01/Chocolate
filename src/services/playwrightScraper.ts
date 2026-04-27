import { chromium } from 'playwright-extra';
// @ts-ignore
import stealth from 'puppeteer-extra-plugin-stealth';
import { Browser } from 'playwright';
import { logger } from '../lib/logger.js';

// Apply stealth plugin
chromium.use(stealth());

export interface ScrapedBusiness {
    name: string;
    website?: string | null;
    phone?: string | null;
    email?: string | null;
    category?: string | null;
    address?: string | null;
}

const JUNK_DOMAINS = [
    'facebook.com', 'instagram.com', 'twitter.com', 'linkedin.com', 'youtube.com', 
    'pinterest.com', 'wikipedia.org', 'yelp.com', 'tripadvisor.com', 'yellowpages.com',
    'google.com', 'yahoo.com', 'bing.com', 'amazon.com', 'apple.com', 'microsoft.com',
    'mapquest.com', 'waze.com', 'zoominfo.com', 'crunchbase.com', 'glassdoor.com',
    'indeed.com', 'monster.com', 'ziprecruiter.com', 'gumtree.com', 'classifieds.co.zw',
    'ownai.co.zw', 'pindula.co.zw', 'herald.co.zw', 'newsday.co.zw', 'standard.co.zw'
];

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0'
];

export class PlaywrightScraper {
    private browser: Browser | null = null;

    async init() {
        // Ensure browser is actually connected/alive
        if (this.browser && !this.browser.isConnected()) {
            logger.warn('[SCRAPER] Browser disconnected, re-initializing...');
            this.browser = null;
        }

        if (!this.browser) {
            this.browser = await chromium.launch({ 
                headless: true, // Stealth plugin handles most detection even in headless
                args: [
                    '--no-sandbox', 
                    '--disable-setuid-sandbox',
                    '--disable-blink-features=AutomationControlled',
                    '--window-size=1920,1080'
                ]
            });
        }
    }

    async scrape(query: string, country: string = 'ZW', page: number = 1): Promise<ScrapedBusiness[]> {
        await this.init();
        
        const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
        const context = await this.browser!.newContext({
            locale: 'en-US',
            timezoneId: 'Africa/Harare',
            userAgent,
            viewport: { width: 1920, height: 1080 },
            extraHTTPHeaders: {
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });
        
        const p = await context.newPage();
        const results: ScrapedBusiness[] = [];
        
        try {
            logger.info(`[ENGINE] High-Fidelity Lead Extraction: ${query}...`);
            
            const searchEngines = [
                {
                    name: 'DuckDuckGo Lite',
                    url: (q: string) => `https://duckduckgo.com/lite/?q=${encodeURIComponent(q + ' Zimbabwe')}&s=${(page - 1) * 30}`,
                    selector: '.result-link',
                    timeout: 40000
                },
                {
                    name: 'Bing',
                    url: (q: string) => `https://www.bing.com/search?q=${encodeURIComponent(q + ' Zimbabwe')}&first=${(page - 1) * 10 + 1}`,
                    selector: 'h2 a, .b_algo h2 a',
                    timeout: 30000
                },
                {
                    name: 'Google',
                    url: (q: string) => `https://www.google.com/search?q=${encodeURIComponent(query + ' Zimbabwe')}`,
                    selector: 'h3',
                    timeout: 45000
                }
            ];

            // Simplified query generation
            const queriesToTry = [query];
            if (query.split(' ').length > 3) {
                const simple = query.split(' ').filter(w => !['local', 'shops', 'store', 'nearby', 'businesses', 'rated', 'best', 'top'].includes(w.toLowerCase())).join(' ');
                if (simple !== query) queriesToTry.push(simple);
            }

            for (const currentQuery of queriesToTry) {
                if (results.length >= 3) break;

                for (const engine of searchEngines) {
                    if (results.length >= 8) break;
                    
                    try {
                        logger.info(`[PLAYWRIGHT] Attempting ${engine.name} for: "${currentQuery}"`);
                        await p.goto(engine.url(currentQuery), { waitUntil: 'domcontentloaded', timeout: engine.timeout });
                        
                        // Wait for actual results to render
                        try {
                            await p.waitForSelector(engine.selector, { timeout: 10000 });
                        } catch (e) {
                            logger.warn(`[SCRAPER] Timeout waiting for ${engine.name} results`);
                            continue;
                        }

                        await p.waitForTimeout(1000 + Math.random() * 2000);

                        const engineLeads = await p.evaluate(({ selector, junkDomains }: any) => {
                            const leads: any[] = [];
                            const JUNK_KEYWORDS = [
                                'how to', 'wikipedia', 'quora', 'reddit', 'what is', 'definition', 
                                'government', 'ministry', 'university', 'school', 'college',
                                'welcome to', 'home page', 'contact us', 'about us', 'privacy policy'
                            ];
                            
                            document.querySelectorAll(selector).forEach(el => {
                                const anchor = (el.tagName === 'A' ? el : el.closest('a')) as HTMLAnchorElement;
                                if (!anchor) return;

                                const element = el as any;
                                let name = (element.textContent || element.innerText || '').split(' - ')[0].split(' | ')[0].split(' : ')[0].trim();
                                const lowerName = name.toLowerCase();
                                
                                // Filter junk
                                const isJunk = JUNK_KEYWORDS.some(k => lowerName.includes(k));
                                if (isJunk || name.length < 3 || name.length > 70) return;

                                const href = anchor.href || '';
                                const isJunkDomain = junkDomains.some((d: string) => href.includes(d));
                                if (href && !isJunkDomain && href.startsWith('http')) {
                                    leads.push({ name, website: href });
                                }
                            });
                            return leads;
                        }, { selector: engine.selector, junkDomains: JUNK_DOMAINS });

                        for (const r of engineLeads) {
                            if (r.name && !results.some(e => e.name === r.name)) {
                                results.push({ ...r, category: `${engine.name} Intelligence` });
                            }
                        }

                        if (results.length > 0) {
                            logger.info(`[PLAYWRIGHT] Secured ${results.length} leads from ${engine.name}`);
                            if (results.length >= 5) break; 
                        }
                    } catch (e: any) {
                        logger.warn(`ΓÜá∩╕Å ${engine.name} failed for "${currentQuery}": ${e.message}`);
                    }
                }
            }
            
            logger.info(`[ENGINE] Extraction complete. ${results.length} high-fidelity leads secured.`);
            
        } catch (err: any) {
            logger.error(`[ERROR] Critical engine failure: ${err.message}`);
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
