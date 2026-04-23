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

    async scrape(query: string, country: string = 'ZW'): Promise<ScrapedBusiness[]> {
        await this.init();
        
        const context = await this.browser!.newContext({
            locale: 'en-US',
            timezoneId: 'Africa/Harare',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
        
        const page = await context.newPage();
        const results: ScrapedBusiness[] = [];
        
        try {
            logger.info(`[ENGINE] High-Fidelity Lead Extraction: ${query}...`);
            
            // --- SOURCE 1: Google (Primary) ---
            try {
                const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query + ' ' + country)}&hl=en&gl=ZW`;
                await page.goto(googleUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
                await page.waitForTimeout(5000); 

                // DIAGNOSTIC SCREENSHOT
                const diagPath = `c:\\Users\\kudzi\\OneDrive\\Documents\\Chocolate-1\\google_diag.png`;
                await page.screenshot({ path: diagPath });
                logger.info(`[DIAG] Search screenshot saved to ${diagPath}`);

                const googleLeads = await page.evaluate((junkDomains) => {
                    const leads: any[] = [];
                    const textContent = document.body.innerText;
                    const phones = textContent.match(/(\+263|071|077|078|09)\s?\d[\d\s-]{6,}\d/g) || [];
                    
                    const JUNK_KEYWORDS = [
                        'how to', 'best', 'top', 'guide', 'list', 'review', 'blog', 
                        'tips', 'cheap', 'free', 'online', 'directory', 'companies in',
                        'news', 'article', 'find', 'buy', 'shop', 'deals', 'discount'
                    ];

                    // 1. Organic Results Sweep
                    document.querySelectorAll('h3').forEach(h3 => {
                        const linkEl = h3.closest('a') || (h3.parentElement as any)?.querySelector('a');
                        if (linkEl) {
                            let rawName = h3.innerText.trim();
                            let name = rawName
                                .split(' - ')[0]
                                .split(' | ')[0]
                                .split(' : ')[0]
                                .split(' – ')[0]
                                .trim();

                            // JUNK FILTERING
                            const lowerName = name.toLowerCase();
                            const isJunkKeyword = JUNK_KEYWORDS.some(k => lowerName.includes(k));
                            const hasPunctuation = /[:\?\!\n]/.test(name); // Reject titles with questions or multiple lines
                            
                            if (isJunkKeyword || hasPunctuation || name.split(/\s+/).length > 8) {
                                return;
                            }
                            if (name.length > 50 || name.length < 3) return;

                            const website = linkEl.href;
                            const isJunkDomain = junkDomains.some((d: string) => website.includes(d));
                            
                            if (website && !isJunkDomain && website.startsWith('http')) {
                                leads.push({ name, website, phone: phones[0] || null });
                            }
                        }
                    });

                    // 2. AI Overview / SGE Squeeze (if present)
                    // Usually bold names in bullet points or carousel cards
                    document.querySelectorAll('div[data-entityname], b, strong').forEach(el => {
                        const text = el.innerText.trim();
                        if (text.length > 3 && text.length < 40 && !text.includes('Google')) {
                            // Only add if it looks like a brand (Title Case)
                            if (/^[A-Z][a-z]+(\s[A-Z][a-z]+)*$/.test(text)) {
                                leads.push({ name: text, category: 'AI Intelligence' });
                            }
                        }
                    });

                    return leads;
                }, JUNK_DOMAINS);

                for (const r of googleLeads) {
                    if (r.name && !results.some(existing => existing.name === r.name)) {
                        results.push({ ...r, category: 'Google Intelligence' });
                    }
                }
            } catch (e) {
                logger.warn('⚠️ Google extraction throttled');
            }

            // --- SOURCE 2: DuckDuckGo (High Privacy / Throttling Resistant) ---
            if (results.length < 5) {
                try {
                    const ddgUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query + ' ' + country)}&kl=zw-en`;
                    await page.goto(ddgUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
                    await page.waitForTimeout(3000); 

                    const ddgLeads = await page.evaluate((junkDomains) => {
                        const leads: any[] = [];
                        document.querySelectorAll('h2 a').forEach(el => {
                            let name = (el as HTMLElement).innerText
                                .split(' - ')[0]
                                .split(' | ')[0]
                                .split(' : ')[0]
                                .trim();

                            if (name.split(/\s+/).length > 10) return;

                            const website = (el as HTMLAnchorElement).href;
                            const isJunk = junkDomains.some((d: string) => website.includes(d));
                            
                            if (website && !isJunk && website.startsWith('http')) {
                                leads.push({ name, website });
                            }
                        });
                        return leads;
                    }, JUNK_DOMAINS);

                    for (const r of ddgLeads) {
                        if (r.name && !results.some(existing => existing.name === r.name)) {
                            results.push({ ...r, category: 'Secondary Sweep' });
                        }
                    }
                } catch (e) {
                    logger.warn('⚠️ Secondary sweep failed');
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
