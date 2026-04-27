import { chromium, Browser } from 'playwright';
import { logger } from '../lib/logger.js';

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

export class PlaywrightScraper {
    private browser: Browser | null = null;

    async init() {
        if (!this.browser) {
            this.browser = await chromium.launch({ 
                headless: true,
                args: [
                    '--no-sandbox', 
                    '--disable-setuid-sandbox',
                    '--disable-blink-features=AutomationControlled'
                ]
            });
        }
    }

    async scrape(query: string, country: string = 'ZW', page: number = 1): Promise<ScrapedBusiness[]> {
        await this.init();
        
        const context = await this.browser!.newContext({
            locale: 'en-US',
            timezoneId: 'Africa/Harare',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            extraHTTPHeaders: {
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });
        
        const p = await context.newPage();
        // Hide webdriver flag
        await p.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        });
        const results: ScrapedBusiness[] = [];
        
        try {
            logger.info(`[ENGINE] High-Fidelity Lead Extraction: ${query}...`);
            
            // --- PRIMARY: DuckDuckGo (bot-friendly, no CAPTCHA) ---
            try {
                const startOffset = (page - 1) * 10;
                const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' Zimbabwe')}&s=${startOffset}`;
                
                logger.info(`[PLAYWRIGHT] Scraping DDG: ${query} (Page: ${page}, Offset: ${startOffset})`);
                await p.goto(ddgUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
                await p.waitForTimeout(2000);

                // Diagnostic screenshot
                const diagPath = `c:\\Users\\kudzi\\OneDrive\\Documents\\Chocolate-1\\google_diag.png`;
                await p.screenshot({ path: diagPath });
                logger.info(`[DIAG] Search screenshot saved to ${diagPath}`);

                const ddgLeads = await p.evaluate((junkDomains) => {
                    const leads: any[] = [];
                    const JUNK_KEYWORDS = [
                        'how to', 'wikipedia', 'quora', 'reddit', 'what is', 'definition',
                        'government', 'ministry', 'university', 'school', 'college'
                    ];

                    // DuckDuckGo HTML version uses .result__title > a
                    const resultLinks = document.querySelectorAll('.result__title a, .result__a, h2 a[href]');
                    resultLinks.forEach(el => {
                        let name = (el as HTMLElement).innerText
                            .split(' - ')[0].split(' | ')[0].split(' : ')[0]
                            .split(' – ')[0].trim();

                        const lowerName = name.toLowerCase();
                        const isJunk = JUNK_KEYWORDS.some(k => lowerName.includes(k));
                        if (isJunk || name.length < 3 || name.length > 70) return;
                        if (name.split(/\s+/).length > 12) return;

                        // Get URL from data-href or href
                        const href = (el as HTMLAnchorElement).href || '';
                        const isJunkDomain = junkDomains.some((d: string) => href.includes(d));
                        if (href && !isJunkDomain && (href.startsWith('http') || href.startsWith('/'))) {
                            const website = href.startsWith('/') ? '' : href;
                            leads.push({ name, website: website || null });
                        }
                    });
                    return leads;
                }, JUNK_DOMAINS);

                for (const r of ddgLeads) {
                    if (r.name && !results.some(e => e.name === r.name)) {
                        results.push({ ...r, category: 'DuckDuckGo Intelligence' });
                    }
                }
            } catch (e: any) {
                logger.warn(`⚠️ DuckDuckGo sweep failed: ${e.message}`);
            }

            // --- FALLBACK: Bing (if DDG yields nothing) ---
            if (results.length < 3) {
                try {
                    const bingUrl = `https://www.bing.com/search?q=${encodeURIComponent(query + ' Zimbabwe')}&first=${(page - 1) * 10 + 1}`;
                    await p.goto(bingUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
                    await p.waitForTimeout(2000);

                    const bingLeads = await p.evaluate((junkDomains) => {
                        const leads: any[] = [];
                        const textContent = document.body.innerText;
                        const phones = textContent.match(/(\+263|071|077|078|09)\s?\d[\d\s-]{6,}\d/g) || [];
                        const JUNK_KEYWORDS = [
                            'how to', 'wikipedia', 'quora', 'reddit', 'what is', 'definition',
                            'government', 'ministry', 'university', 'school', 'college'
                        ];

                        document.querySelectorAll('h2 a, .b_algo h2 a').forEach(el => {
                            let name = (el as HTMLElement).innerText
                                .split(' - ')[0].split(' | ')[0].split(' : ')[0].trim();
                            const lowerName = name.toLowerCase();
                            const isJunk = JUNK_KEYWORDS.some(k => lowerName.includes(k));
                            if (isJunk || name.length < 3 || name.length > 70) return;

                            const href = (el as HTMLAnchorElement).href || '';
                            const isJunkDomain = junkDomains.some((d: string) => href.includes(d));
                            if (href && !isJunkDomain && href.startsWith('http')) {
                                leads.push({ name, website: href, phone: phones[0] || null });
                            }
                        });
                        return leads;
                    }, JUNK_DOMAINS);

                    for (const r of bingLeads) {
                        if (r.name && !results.some(e => e.name === r.name)) {
                            results.push({ ...r, category: 'Bing Intelligence' });
                        }
                    }
                } catch (e) {
                    logger.warn('⚠️ Bing fallback failed');
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
