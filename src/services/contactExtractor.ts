import { chromium } from 'playwright';
import { logger } from '../lib/logger.js';

export class ContactExtractor {
    async extract(url: string): Promise<{ email?: string | null, phone?: string | null, screenshot?: Buffer | null }> {
        if (!url || url.includes('google.com') || url.includes('facebook.com')) return {};

        let browser;
        try {
            browser = await chromium.launch({ headless: true });
            const context = await browser.newContext({ userAgent: 'Mozilla/5.0' });
            const page = await context.newPage();
            
            logger.debug(`[HUNGRY] Diving into ${url}...`);
            await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
            
            let email: string | null = null;
            let phone: string | null = null;
            let screenshot: Buffer | null = null;

            const scan = async () => {
                const content = await page.content();
                const text = await page.evaluate(() => document.body.innerText);
                
                const eMatch = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
                const pMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4,6}/g);
                
                if (!email && eMatch) email = eMatch[0];
                if (!phone && pMatch) phone = pMatch[0];
            };

            await scan();

            // If missing phone, try to find a contact page
            if (!phone) {
                const contactLink = await page.evaluate(() => {
                    const links = Array.from(document.querySelectorAll('a'));
                    const target = links.find(a => {
                        const t = a.innerText.toLowerCase();
                        return t.includes('contact') || t.includes('about') || t.includes('us');
                    });
                    return target ? target.href : null;
                });

                if (contactLink && contactLink !== url) {
                    logger.debug(`[HUNGRY] Checking sub-page: ${contactLink}`);
                    await page.goto(contactLink, { waitUntil: 'domcontentloaded', timeout: 15000 });
                    await scan();
                }
            }

            screenshot = await page.screenshot({ type: 'png' });

            return { email, phone, screenshot };
        } catch (error) {
            logger.debug(`[HUNGRY] Failed to extract from ${url}`);
            return {};
        } finally {
            if (browser) await browser.close();
        }
    }
}

export const contactExtractor = new ContactExtractor();
