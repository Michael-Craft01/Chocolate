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
        
        // --- REGION FIX: Force English and Zimbabwe ---
        const context = await this.browser!.newContext({
            locale: 'en-US',
            timezoneId: 'Africa/Harare',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
        
        const page = await context.newPage();
        const results: ScrapedBusiness[] = [];
        
        try {
            console.log(`\n[ENGINE] Hunting (English/ZW Mode): ${query}...`);
            
            // --- SOURCE 1: Google (Primary - English/ZW) ---
            try {
                const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query + ' ' + country)}&hl=en&gl=ZW`;
                await page.goto(googleUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
                await page.waitForTimeout(5000); 
                
                // GOOGLE DIAGNOSTIC
                const googleSnapPath = `C:\\Users\\kudzi\\.gemini\\antigravity\\brain\\fba35c1b-2511-4e63-906f-4e3641ff89aa\\google_diag.png`;
                await page.screenshot({ path: googleSnapPath });
                console.log(`[DIAG] Google Screenshot saved to: ${googleSnapPath}`);

                const googleLeads = await page.evaluate(() => {
                    const leads: any[] = [];
                    
                    // 1. SQUEEZE: Extract from AI Overview & Knowledge Panels
                    const textContent = document.body.innerText;
                    // Look for phone numbers in the whole page
                    const phones = textContent.match(/(\+263|071|077|078|09)\s?\d[\d\s-]{6,}\d/g) || [];
                    
                    // 2. Extract from any result-like container
                    const allLinks = Array.from(document.querySelectorAll('a[href]'));
                    allLinks.forEach(el => {
                        const href = (el as HTMLAnchorElement).href;
                        const name = (el as HTMLElement).innerText.trim();
                        if (href && !href.includes('google.com') && href.startsWith('http')) {
                            leads.push({ 
                                name: name || 'Business', 
                                website: href,
                                phone: phones[0] || null // Attach first found phone as fallback
                            });
                        }
                    });

                    // 3. Special: Look for bolded titles in AI overview
                    document.querySelectorAll('b, strong, [role="heading"]').forEach(el => {
                        const text = (el as HTMLElement).innerText.trim();
                        if (text.length > 5 && text.length < 50 && !text.includes('Google')) {
                            leads.push({ name: text, category: 'AI Discovery' });
                        }
                    });

                    return leads;
                });
                for (const r of googleLeads) {
                    if (r.name && !results.some(existing => existing.name === r.name)) {
                        results.push({ ...r, category: 'Google' });
                    }
                }
                logger.info(`📊 Squeezed ${results.length} leads from Google`);
            } catch (e) {
                logger.warn('⚠️ Google failed, trying Yahoo...');
            }

            // --- SOURCE 2: Yahoo (Fallback) ---
            if (results.length < 5) {
                const yahooUrl = `https://search.yahoo.com/search?p=${encodeURIComponent(query + ' ' + country)}`;
                try {
                    await page.goto(yahooUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
                    await page.waitForTimeout(3000); 
                    const yahooLeads = await page.evaluate(() => {
                        const leads: any[] = [];
                        const results = Array.from(document.querySelectorAll('h3 a[href]'));
                        results.forEach(el => {
                            const href = (el as HTMLAnchorElement).href;
                            const name = (el as HTMLElement).innerText.trim();
                            if (href && !href.includes('yahoo.com') && href.startsWith('http')) {
                                leads.push({ name, website: href });
                            }
                        });
                        return leads;
                    });
                    for (const r of yahooLeads) {
                        if (!results.some(existing => existing.website === r.website)) {
                            results.push({ ...r, category: 'Yahoo' });
                        }
                    }
                } catch (e) {
                    logger.warn('⚠️ Yahoo fallback failed');
                }
            }
            
            console.log(`[ENGINE] Found ${results.length} leads in total.`);
            
        } catch (err: any) {
            console.error(`[ERROR] Engine failure: ${err.message}`);
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
