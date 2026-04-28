import prisma from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { queryGenerator, QueryData } from './queryGenerator.js';
import { scraper } from './scraper.js';
import { aiService } from './aiService.js';
import { messageGenerator } from './messageGenerator.js';
import { dispatchService } from './dispatchService.js';
import { cleanupDatabase } from './databaseCleanup.js';
import { contactExtractor } from './contactExtractor.js';

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

        return await tx.lead.create({
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
    });
}

export async function processLeadsForQuery(campaign: any, queryData: QueryData, targetCount: number, sweepId?: string, sweepDate?: Date): Promise<number> {
    let leadsFound = 0;
    try {
        if (!campaign || campaign.status !== 'ACTIVE') return 0;
        const businesses = await scraper.scrape(queryData.query, queryData.country, queryData.page);
        if (!businesses || businesses.length === 0) return 0;

        const results = businesses.slice(0, targetCount);

        const user = await prisma.user.findUnique({ where: { id: campaign.userId } });
        if (!user) return leadsFound;

        for (const business of results) {
            try {
                if (user.leadsFoundToday >= user.dailyLimit && user.creditBalance <= 0) break;

                let visualIntel: Buffer | null = null;
                // Deep Dive if we are missing contact info
                if (business.website && (!business.email || !business.phone)) {
                    try {
                        const deepData = await contactExtractor.extract(business.website);
                        business.email = business.email || deepData.email;
                        business.phone = business.phone || deepData.phone;
                        visualIntel = deepData.screenshot || null;
                    } catch (e) {
                        logger.warn(`[HUNGRY] Contact extraction failed for ${business.name} at ${business.website}`);
                    }
                }

                // CRITICAL QUALITY GATE: Only save if we now have a phone number (either from search or deep dive)
                if (!business.phone) {
                    logger.debug(`[QUALITY CONTROL] Skipping ${business.name} - No phone number found even after deep dive.`);
                    continue;
                }

                const telemetry = `${business.address || ''} | ${business.website || 'No Site'}`;
                const enrichment = await aiService.enrichLead(business.name, business.category ?? undefined, {
                    productDescription: campaign.productDescription,
                    targetPainPoints: campaign.targetPainPoints
                }, telemetry, visualIntel);

                const result = await syncLeadToDb(business, enrichment, campaign, sweepId, sweepDate);
                if (result) {
                    await prisma.user.update({ where: { id: user.id }, data: { leadsFoundToday: { increment: 1 } } });
                    user.leadsFoundToday++; 
                    leadsFound++;
                }
            } catch (err) {
                logger.error({ err }, 'Sync failed');
            }
        }
        return leadsFound;
    } catch (error) {
        logger.error({ error }, 'Process failed');
        return leadsFound;
    }
}

export async function triggerEngineCycle() {
    logger.info('🚀 Cycle start');
    const sweepId = `sweep_${Date.now()}`;
    const sweepDate = new Date();
    const cycleSummary: any[] = [];

    try {
        const activeCampaigns = await prisma.campaign.findMany({ where: { status: 'ACTIVE' }, include: { user: true } });

        for (const campaign of activeCampaigns) {
            const user = await prisma.user.findUnique({ where: { id: campaign.userId } });
            if (!user) continue;

            const target = user.dailyLimit;
            let campaignTotal = 0;
            let round = 0;
            const MAX_ROUNDS = 20; // Safety cap to avoid infinite loops

            logger.info(`🎯 Campaign "${campaign.name}" — targeting ${target} leads (currently at ${user.leadsFoundToday})`);

            while (campaignTotal + user.leadsFoundToday < target && round < MAX_ROUNDS) {
                round++;
                const needed = target - (campaignTotal + user.leadsFoundToday);
                logger.info(`🔄 Round ${round} — need ${needed} more leads for campaign "${campaign.name}"`);

                const queries = await queryGenerator.generateBatchQueries(50, campaign);
                if (queries.length === 0) {
                    logger.warn('No new queries available — rotating to next round');
                    break;
                }

                for (const query of queries) {
                    const stillNeeded = target - (campaignTotal + user.leadsFoundToday);
                    if (stillNeeded <= 0) break;

                    const count = await processLeadsForQuery(campaign, query, Math.min(15, stillNeeded), sweepId, sweepDate);
                    campaignTotal += count;

                    // If we found nothing, reset this query's pagination for next time
                    if (count === 0) {
                        await prisma.queryHistory.update({
                            where: {
                                location_industry_campaignId: {
                                    location: query.location,
                                    industry: query.industry,
                                    campaignId: campaign.id
                                }
                            },
                            data: { page: 1 } as any
                        }).catch(() => {});
                    }
                }
            }

            if (campaignTotal + user.leadsFoundToday >= target) {
                logger.info(`✅ Campaign "${campaign.name}" hit target! ${campaignTotal} leads secured this cycle.`);
            } else {
                logger.warn(`⚠️ Campaign "${campaign.name}" ended at ${campaignTotal} leads after ${round} rounds.`);
            }

            cycleSummary.push({ campaign: campaign.name, count: campaignTotal });
        }

        await cleanupDatabase();
        return cycleSummary;
    } catch (error) {
        logger.error({ error }, 'Cycle failed');
        throw error;
    }
}

