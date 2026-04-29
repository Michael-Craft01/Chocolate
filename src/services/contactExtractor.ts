import { chromium } from 'playwright';
import { logger } from '../lib/logger.js';

export class ContactExtractor {
    async extract(url: string): Promise<{ email?: string | null; phone?: string | null; screenshot?: Buffer | null }> {
        if (!url) return {};

        // Block known junk domains that will never have contact info
        const blocked = ['google.com', 'facebook.com', 'instagram.com', 'twitter.com', 'linkedin.com', 'youtube.com', 'apple.com', 'microsoft.com'];
        if (blocked.some(d => url.includes(d))) return {};

        let browser;
        try {
            browser = await chromium.launch({ headless: true });
            const context = await browser.newContext({
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            });
            const page = await context.newPage();

            logger.info(`[HUNGRY] Deep-diving into ${url}...`);

            try {
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
            } catch {
                await page.goto(url, { waitUntil: 'commit', timeout: 15000 }).catch(() => {});
            }
            await page.waitForTimeout(1500);

            let email: string | null = null;
            let phone: string | null = null;

            /**
             * Multi-strategy phone extraction from any page.
             * Strategies run in order of reliability.
             */
            const extractPhone = async (): Promise<string | null> => {
                return page.evaluate((): string | null => {
                    // ── S1: tel: href links ─ most reliable ──
                    const telLinks = Array.from(document.querySelectorAll('a[href^="tel:"]'));
                    for (const a of telLinks) {
                        const raw = (a as HTMLAnchorElement).href.replace('tel:', '').replace(/\s/g, '');
                        if (raw.replace(/\D/g, '').length >= 7) return raw;
                    }

                    // ── S2: WhatsApp wa.me links ──
                    const waLinks = Array.from(document.querySelectorAll('a[href*="wa.me/"]'));
                    for (const a of waLinks) {
                        const href = (a as HTMLAnchorElement).href;
                        const m = href.match(/wa\.me\/(\+?\d+)/);
                        if (m) return '+' + m[1].replace(/^\+/, '');
                    }

                    // ── S3: JSON-LD structured data (schema.org) ──
                    const jsonLdScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
                    for (const s of jsonLdScripts) {
                        try {
                            const data = JSON.parse(s.textContent || '{}');
                            const find = (obj: any): string | null => {
                                if (!obj || typeof obj !== 'object') return null;
                                if (obj.telephone) return String(obj.telephone);
                                if (obj.phone) return String(obj.phone);
                                for (const v of Object.values(obj)) {
                                    const r = find(v);
                                    if (r) return r;
                                }
                                return null;
                            };
                            const found = find(data);
                            if (found && found.replace(/\D/g, '').length >= 7) return found;
                        } catch {}
                    }

                    // ── S4: OpenGraph / meta phone tags ──
                    const metaPhone = document.querySelector('meta[property="business:contact_data:phone_number"], meta[name="phone"], meta[name="telephone"]');
                    if (metaPhone) {
                        const val = metaPhone.getAttribute('content') || '';
                        if (val.replace(/\D/g, '').length >= 7) return val;
                    }

                    // ── S5: Visible text regex (broad, catches most local formats) ──
                    const text = document.body?.innerText || '';
                    const patterns = [
                        // Zimbabwe/Africa: +263 77 xxx xxxx, 077 xxx xxxx
                        /\+263[\s.-]?\d{2}[\s.-]?\d{3}[\s.-]?\d{4}/g,
                        // South Africa: +27 81..., 081...
                        /\+27[\s.-]?\d{2}[\s.-]?\d{3}[\s.-]?\d{4}/g,
                        // Local Zimbabwe mobile: 07x xxx xxxx
                        /0[678]\d[\s.-]?\d{3}[\s.-]?\d{4}/g,
                        // International E.164
                        /\+\d{1,3}[\s.-]?\d{2,4}[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g,
                        // Generic local with brackets: (04) 123-4567
                        /\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g,
                    ];
                    for (const pattern of patterns) {
                        const matches = text.match(pattern);
                        if (matches) {
                            // Pick the first match that has enough digits
                            const valid = matches.find(m => m.replace(/\D/g, '').length >= 7);
                            if (valid) return valid.trim();
                        }
                    }

                    return null;
                }).catch(() => null);
            };

            const extractEmail = async (): Promise<string | null> => {
                return page.evaluate((): string | null => {
                    // S1: mailto: links
                    const mailLink = document.querySelector('a[href^="mailto:"]');
                    if (mailLink) {
                        const raw = (mailLink as HTMLAnchorElement).href.replace('mailto:', '').split('?')[0].trim();
                        if (raw.includes('@') && !raw.includes('example') && !raw.includes('sentry')) return raw;
                    }

                    // S2: JSON-LD
                    const jsonLdScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
                    for (const s of jsonLdScripts) {
                        try {
                            const data = JSON.parse(s.textContent || '{}');
                            const find = (obj: any): string | null => {
                                if (!obj || typeof obj !== 'object') return null;
                                if (obj.email && String(obj.email).includes('@')) return String(obj.email);
                                for (const v of Object.values(obj)) { const r = find(v); if (r) return r; }
                                return null;
                            };
                            const found = find(data);
                            if (found) return found;
                        } catch {}
                    }

                    // S3: Text regex
                    const text = document.body?.innerText || '';
                    const m = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g);
                    return m?.find(e => !e.includes('example') && !e.includes('sentry') && !e.includes('wixpress') && !e.includes('schema')) || null;
                }).catch(() => null);
            };

            phone = await extractPhone();
            email = await extractEmail();

            // If phone still missing, try the contact/about sub-page
            if (!phone) {
                const contactLink = await page.evaluate((): string | null => {
                    const links = Array.from(document.querySelectorAll('a[href]'));
                    const target = links.find(a => {
                        const text = ((a as HTMLAnchorElement).innerText || a.textContent || '').toLowerCase();
                        const href = (a as HTMLAnchorElement).href.toLowerCase();
                        return (text.includes('contact') || text.includes('reach us') || text.includes('get in touch'))
                            || (href.includes('/contact') || href.includes('/reach-us'));
                    });
                    return target ? (target as HTMLAnchorElement).href : null;
                }).catch(() => null);

                if (contactLink && !contactLink.includes('google.com') && contactLink !== url) {
                    logger.info(`[HUNGRY] Scanning contact sub-page: ${contactLink}`);
                    await page.goto(contactLink, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
                    await page.waitForTimeout(1000);
                    phone = phone || await extractPhone();
                    email = email || await extractEmail();
                }
            }

            if (phone) logger.info(`[HUNGRY] ✅ Phone found for ${url}: ${phone}`);
            if (email) logger.info(`[HUNGRY] ✅ Email found for ${url}: ${email}`);

            const screenshot = await page.screenshot({ type: 'png' }).catch(() => null);
            return { email, phone, screenshot };

        } catch (err: any) {
            logger.debug(`[HUNGRY] Extraction failed for ${url}: ${err.message}`);
            return {};
        } finally {
            if (browser) await browser.close();
        }
    }
}

export const contactExtractor = new ContactExtractor();
