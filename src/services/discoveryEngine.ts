import prisma from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { queryGenerator, QueryData } from './queryGenerator.js';
import { scraper } from './scraper.js';
import { aiService } from './aiService.js';
import { messageGenerator } from './messageGenerator.js';
import { dispatchService } from './dispatchService.js';
import { cleanupDatabase } from './databaseCleanup.js';
import { contactExtractor } from './contactExtractor.js';
import { withRetry, sleep } from '../lib/utils.js';

const CONCURRENCY_LIMIT = 5;

async function syncLeadToDb(business: any, enrichment: any, campaign: any, sweepId?: string, sweepDate?: Date) {
    const cleanName = enrichment.brandName;
    const painPoint = enrichment.painPoint || 'operational friction';
    const message = await messageGenerator.generate(campaign, cleanName, enrichment.industry || 'your industry', painPoint, campaign.productName);

    return await prisma.$transaction(async (tx) => {
        let dbBusiness = await tx.business.findFirst({
            where: { 
                name: cleanName, 
                OR: [{ phone: business.phone || undefined }, { website: business.website || undefined }] 
            }
        });

        if (!dbBusiness) {
            dbBusiness = await tx.business.create({ 
                data: { 
                    name: cleanName, 
                    website: business.website || '', 
                    phone: business.phone || '', 
                    email: business.email || '' 
                } 
            });
        }

        const existingLead = await tx.lead.findFirst({ where: { businessId: dbBusiness.id, campaignId: campaign.id } });
        if (existingLead) return null;

        const newLead = await tx.lead.create({
            data: {
                campaignId: campaign.id,
                businessId: dbBusiness.id,
                industry: enrichment.industry,
                painPoint: enrichment.painPoint,
                suggestedMessage: message,
                sweepId: sweepId || null,
                sweepDate: sweepDate || null
            }
        });

        logger.info(`✅ [SYNC] Lead saved successfully: ${cleanName} for Campaign: ${campaign.name}`);
        return newLead;
    });
}

export async function processLeadsForQuery(campaign: any, queryData: QueryData, targetCount: number, sweepId?: string, sweepDate?: Date): Promise<number> {
    let leadsFound = 0;
    try {
        if (!campaign || campaign.status !== 'ACTIVE') return 0;
        
        // Industrial Retry for Scraper
        const businesses = await withRetry(
            () => scraper.scrape(queryData.query, queryData.country, queryData.page),
            { retries: 3, delay: 2000, factor: 2, taskName: `Scrape: ${queryData.query}` }
        ).catch(() => []);

        if (!businesses || businesses.length === 0) return 0;

        const results = businesses.slice(0, targetCount);

        const user = await prisma.user.findUnique({ where: { id: campaign.userId } });
        if (!user) return leadsFound;

        for (const business of results) {
            try {
                if (user.leadsFoundToday >= user.dailyLimit && user.creditBalance <= 0) break;

                let visualIntel: Buffer | null = null;
                
                // Deep Dive with retry
                if (business.website && (!business.email || !business.phone)) {
                    try {
                        const deepData = await withRetry(
                            () => contactExtractor.extract(business.website),
                            { retries: 2, delay: 1000, factor: 1.5, taskName: `Extract: ${business.name}` }
                        );
                        business.email = business.email || deepData.email;
                        business.phone = business.phone || deepData.phone;
                        visualIntel = deepData.screenshot || null;
                    } catch (e) {
                        logger.warn(`[HUNGRY] Contact extraction failed for ${business.name} after retries.`);
                    }
                }

                // CRITICAL QUALITY GATE: Only save if we now have a phone number
                if (!business.phone) {
                    logger.warn(`[QUALITY CONTROL] Skipping ${business.name} - No phone number found.`);
                    continue;
                }

                const telemetry = `${business.address || ''} | ${business.website || 'No Site'}`;
                
                // AI Enrichment with Fallback
                let enrichment;
                try {
                    enrichment = await withRetry(
                        () => aiService.enrichLead(business.name, business.category ?? undefined, {
                            productDescription: campaign.productDescription,
                            targetPainPoints: campaign.targetPainPoints
                        }, telemetry, visualIntel),
                        { retries: 2, delay: 1000, factor: 2, taskName: `AI Enrich: ${business.name}` }
                    );
                } catch (e) {
                    logger.warn(`[FALLBACK] AI Enrichment failed for ${business.name}. Using raw data.`);
                    enrichment = {
                        brandName: business.name,
                        industry: business.category || 'General',
                        painPoint: 'efficiency'
                    };
                }

                const result = await syncLeadToDb(business, enrichment, campaign, sweepId, sweepDate);
                if (result) {
                    await prisma.user.update({ where: { id: user.id }, data: { leadsFoundToday: { increment: 1 } } });
                    user.leadsFoundToday++; 
                    leadsFound++;
                }

                // Stealth Delay to prevent detection
                await sleep(500);
            } catch (err) {
                logger.error({ err }, 'Individual lead processing failed. Continuing batch.');
            }
        }
        return leadsFound;
    } catch (error) {
        logger.error({ error }, 'Query processing cycle failed');
        return leadsFound;
    }
}

export async function triggerEngineCycle() {
    logger.info('🚀 Cycle start');
    const cycleSummary: { campaign: string, count: number }[] = [];
    
    // ── QUOTA RESET PROTOCOL ──
    try {
        // Wait a tiny bit for DB to be warm if this is a fresh start
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        await prisma.user.updateMany({
            where: { lastQuotaReset: { lt: yesterday } },
            data: { leadsFoundToday: 0, lastQuotaReset: now }
        });
        logger.info('🔄 Daily quotas reset successfully');
    } catch (e: any) {
        logger.error({ err: e.message }, 'Quota reset failed (likely connection pool burst)');
        // Continue anyway, it will retry next cycle
    }

    const sweepId = `sweep_${Date.now()}`;
    const sweepDate = new Date();
    const userResults: Record<string, { campaignName: string, count: number }[]> = {};

    try {
        const activeCampaigns = await prisma.campaign.findMany({ 
            where: { status: 'ACTIVE' }, 
            include: { user: true } 
        });

        if (activeCampaigns.length === 0) return [];

        for (const campaign of activeCampaigns) {
            // ── PRE-FLIGHT IDENTITY CHECK ──
            const isIdentityComplete = 
                campaign.productDescription?.length > 10 && 
                campaign.targetPainPoints?.length > 5 &&
                campaign.locations.length > 0 &&
                campaign.industries.length > 0;

            if (!isIdentityComplete) {
                logger.warn(`⚠️ [QUALITY GUARD] Campaign "${campaign.name}" skipped: User identity/persona details incomplete.`);
                continue;
            }

            const user = await prisma.user.findUnique({ where: { id: campaign.userId } });
            if (!user) continue;

            // ── FAIR SHARE QUOTA SPLITTING ──
            // Get all active campaigns for THIS specific user to split their quota fairly
            const userActiveCampaigns = activeCampaigns.filter(c => c.userId === user.id);
            const dailyRemaining = user.dailyLimit - user.leadsFoundToday;
            
            // Aim for 50% of daily limit per cycle total, split across active campaigns
            const totalCycleTarget = Math.ceil(user.dailyLimit * 0.5);
            const cycleTargetForUser = Math.min(totalCycleTarget, dailyRemaining);
            
            // Each campaign gets a fair slice of the current cycle's target
            const target = Math.max(1, Math.floor(cycleTargetForUser / userActiveCampaigns.length));

            if (target <= 0 || dailyRemaining <= 0) {
                logger.info(`⏹️ [QUOTA] Campaign "${campaign.name}" skipped: User daily limit reached (${user.leadsFoundToday}/${user.dailyLimit}).`);
                continue;
            }

            let campaignTotal = 0;
            let round = 0;
            const MAX_ROUNDS = 10;

            logger.info(`🎯 Campaign "${campaign.name}" — Cycle Target: ${target} leads (Daily: ${user.leadsFoundToday}/${user.dailyLimit})`);

            while (campaignTotal < target && round < MAX_ROUNDS) {
                round++;
                const needed = target - campaignTotal;
                logger.info(`🔄 Round ${round} — need ${needed} more leads for cycle goal on "${campaign.name}"`);

                const queries = await queryGenerator.generateBatchQueries(20, campaign);
                if (queries.length === 0) break;

                for (const query of queries) {
                    const stillNeeded = target - campaignTotal;
                    if (stillNeeded <= 0) break;

                    const count = await processLeadsForQuery(campaign, query, Math.min(10, stillNeeded), sweepId, sweepDate);
                    campaignTotal += count;
                    
                    // Don't hammer the APIs
                    await sleep(1000);
                }
            }

            // Track results for summary email
            if (!userResults[campaign.userId]) userResults[campaign.userId] = [];
            userResults[campaign.userId].push({ campaignName: campaign.name, count: campaignTotal });

            cycleSummary.push({ campaign: campaign.name, count: campaignTotal });
        }

        // Send User Summaries
        for (const [userId, results] of Object.entries(userResults)) {
            await dispatchService.sendUserCycleSummary(userId, results).catch(e => logger.error({ err: e.message }, 'Failed to send summary email'));
        }

        await cleanupDatabase();
        return cycleSummary;
    } catch (error) {
        logger.error({ error }, 'Cycle failed');
        throw error;
    }
}

