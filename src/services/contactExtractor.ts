import { chromium } from 'playwright';
import { logger } from '../lib/logger.js';

export class ContactExtractor {
    async extract(url: string): Promise<{
        email?: string | null;
        phone?: string | null;
        contactPages?: string[];
        socialProfiles?: string[];
        decisionMakers?: Array<{ name: string; role?: string | null; profileUrl?: string | null; sourceUrl?: string | null; confidence?: number | null }>;
        screenshot?: Buffer | null;
    }> {
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
            let contactPages: string[] = [];
            let socialProfiles: string[] = [];
            let decisionMakers: Array<{ name: string; role?: string | null; profileUrl?: string | null; sourceUrl?: string | null; confidence?: number | null }> = [];

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
                        if (m && m[1]) return '+' + m[1].replace(/^\+/, '');
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
                    const mailLinks = Array.from(document.querySelectorAll('a[href^="mailto:"]'));
                    for (const a of mailLinks) {
                        const href = (a as HTMLAnchorElement).href;
                        const raw = href.replace('mailto:', '').split('?')[0]!.trim();
                        if (raw.includes('@') && !raw.includes('example') && !raw.includes('sentry') && !raw.includes('wixpress')) return raw;
                    }

                    // S2: JSON-LD
                    const jsonLdScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
                    for (const s of jsonLdScripts) {
                        try {
                            const data = JSON.parse(s.textContent || '{}');
                            const find = (obj: any): string | null => {
                                if (!obj || typeof obj !== 'object') return null;
                                if (obj.email && String(obj.email).includes('@')) {
                                    const raw = String(obj.email).trim();
                                    if (!raw.includes('example') && !raw.includes('sentry')) return raw;
                                }
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
                    const foundInText = m?.find(e => !e.includes('example') && !e.includes('sentry') && !e.includes('wixpress') && !e.includes('schema'));
                    if (foundInText) return foundInText;

                    // S4: Raw HTML source search (documentElement.innerHTML)
                    const html = document.documentElement?.innerHTML || '';
                    const mHtml = html.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g);
                    return mHtml?.find(e => !e.includes('example') && !e.includes('sentry') && !e.includes('wixpress') && !e.includes('schema') && !e.endsWith('.png') && !e.endsWith('.jpg') && !e.endsWith('.webp')) || null;
                }).catch(() => null);
            };

            const extractRouteIntel = async () => {
                return page.evaluate(() => {
                    const unique = (values: string[]) => Array.from(new Set(values.map(v => v.trim()).filter(Boolean)));
                    const links = Array.from(document.querySelectorAll('a[href]')) as HTMLAnchorElement[];
                    const socialDomains = ['linkedin.com', 'facebook.com', 'instagram.com', 'x.com', 'twitter.com', 'wa.me', 'api.whatsapp.com'];
                    const contactKeywords = ['contact', 'reach us', 'get in touch', 'support', 'enquiry', 'enquiries', 'book', 'quote'];
                    const titleKeywords = ['founder', 'ceo', 'director', 'owner', 'manager', 'sales', 'marketing', 'operations', 'partner'];

                    const contactPages = unique(links
                        .filter(a => {
                            const text = `${a.innerText || ''} ${a.textContent || ''}`.toLowerCase();
                            const href = a.href.toLowerCase();
                            return contactKeywords.some(k => text.includes(k) || href.includes(k.replace(/\s/g, '-')) || href.includes(k.replace(/\s/g, '')));
                        })
                        .map(a => a.href)
                        .filter(href => href.startsWith('http') && !href.includes('google.com')));

                    const socialProfiles = unique(links
                        .map(a => a.href)
                        .filter(href => href.startsWith('http') && socialDomains.some(domain => href.includes(domain))));

                    const text = document.body?.innerText || '';
                    const people: Array<{ name: string; role?: string | null; profileUrl?: string | null; sourceUrl?: string | null; confidence?: number | null }> = [];
                    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 3 && line.length < 120);
                    for (const line of lines) {
                        const lower = line.toLowerCase();
                        const role = titleKeywords.find(keyword => lower.includes(keyword));
                        if (!role) continue;
                        const nameMatch = line.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\b/);
                        if (!nameMatch?.[1]) continue;
                        people.push({ name: nameMatch[1], role, sourceUrl: location.href, confidence: 55 });
                        if (people.length >= 5) break;
                    }

                    for (const link of links) {
                        if (!link.href.includes('linkedin.com/in/')) continue;
                        const label = (link.innerText || link.textContent || '').trim();
                        if (label.length < 3 || label.length > 80) continue;
                        people.push({ name: label, role: null, profileUrl: link.href, sourceUrl: location.href, confidence: 65 });
                    }

                    const seenPeople = new Set<string>();
                    const decisionMakers = people.filter(person => {
                        const key = `${person.name.toLowerCase()}|${person.profileUrl || ''}`;
                        if (seenPeople.has(key)) return false;
                        seenPeople.add(key);
                        return true;
                    }).slice(0, 6);

                    return { contactPages, socialProfiles, decisionMakers };
                }).catch(() => ({ contactPages: [], socialProfiles: [], decisionMakers: [] }));
            };

            phone = await extractPhone();
            email = await extractEmail();
            const routeIntel = await extractRouteIntel();
            contactPages = routeIntel.contactPages;
            socialProfiles = routeIntel.socialProfiles;
            decisionMakers = routeIntel.decisionMakers;

            // If email is missing, try scanning candidate sub-pages in prioritized order
            if (!email) {
                const candidateLinks = await page.evaluate(() => {
                    const links = Array.from(document.querySelectorAll('a[href]')) as HTMLAnchorElement[];
                    const contactKeywords = ['contact', 'about', 'team', 'staff', 'reach', 'info', 'support', 'privacy', 'terms', 'help'];
                    
                    const candidates: string[] = [];
                    for (const a of links) {
                        const text = ((a.innerText || '') + ' ' + (a.textContent || '')).toLowerCase();
                        const href = (a.href || '').toLowerCase();
                        
                        if (!href.startsWith('http') || href.includes('google.com') || href.includes('facebook.com') || href.includes('linkedin.com')) {
                            continue;
                        }
                        
                        let match = false;
                        for (const k of contactKeywords) {
                            if (text.includes(k) || href.includes(k.replace(/\s/g, '-')) || href.includes(k.replace(/\s/g, ''))) {
                                match = true;
                                break;
                            }
                        }
                        
                        if (match) {
                            candidates.push(a.href);
                        }
                    }
                    
                    const seen = new Set<string>();
                    const uniqueCandidates: string[] = [];
                    for (const c of candidates) {
                        const trimmed = c.trim();
                        if (trimmed && !seen.has(trimmed)) {
                            seen.add(trimmed);
                            uniqueCandidates.push(trimmed);
                        }
                    }
                    return uniqueCandidates;
                }).catch((err) => {
                    logger.error(`[HUNGRY] [ERROR] candidateLinks evaluate failed: ${err.message}`);
                    return [];
                });

                const pagesToScan = candidateLinks.filter(link => {
                    const cleanLink = link.replace(/\/$/, '');
                    const cleanUrl = url.replace(/\/$/, '');
                    return cleanLink !== cleanUrl;
                }).slice(0, 4);

                logger.info(`[HUNGRY] Email missing on home page. Sourcing ${pagesToScan.length} candidate sub-pages...`);

                for (const subPage of pagesToScan) {
                    if (email) break;
                    logger.info(`[HUNGRY] Scanning sub-page: ${subPage}`);
                    try {
                        await page.goto(subPage, { waitUntil: 'domcontentloaded', timeout: 12000 }).catch(() => {});
                        await page.waitForTimeout(800);
                        
                        const subEmail = await extractEmail();
                        if (subEmail) {
                            email = subEmail;
                            logger.info(`[HUNGRY] ✅ Email found on sub-page ${subPage}: ${email}`);
                        }
                        phone = phone || await extractPhone();
                        const subIntel = await extractRouteIntel();
                        contactPages = Array.from(new Set([...contactPages, subPage, ...subIntel.contactPages]));
                        socialProfiles = Array.from(new Set([...socialProfiles, ...subIntel.socialProfiles]));
                        decisionMakers = [...decisionMakers, ...subIntel.decisionMakers].slice(0, 8);
                    } catch (e: any) {
                        logger.warn(`[HUNGRY] Sub-page scan failed for ${subPage}: ${e.message}`);
                    }
                }
            }

            if (phone) logger.info(`[HUNGRY] ✅ Phone found for ${url}: ${phone}`);
            if (email) logger.info(`[HUNGRY] ✅ Email found for ${url}: ${email}`);

            const screenshot = await page.screenshot({ type: 'png' }).catch(() => null);
            return { email, phone, contactPages, socialProfiles, decisionMakers, screenshot };

        } catch (err: any) {
            logger.debug(`[HUNGRY] Extraction failed for ${url}: ${err.message}`);
            return {};
        } finally {
            if (browser) await browser.close();
        }
    }
}

export const contactExtractor = new ContactExtractor();
