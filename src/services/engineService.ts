import { queryGenerator, QueryData } from './queryGenerator.js';
import { scraper } from './scraper.js';
import { aiService } from './aiService.js';
import { messageGenerator } from './messageGenerator.js';
import { dispatchService } from './dispatchService.js';
import { cleanupDatabase } from './databaseCleanup.js';
import { contactExtractor } from './contactExtractor.js';

const CONCURRENCY_LIMIT = 5; // Simultaneous queries per campaign
const AI_CONCURRENCY_LIMIT = 3; // Simultaneous AI enrichments

async function processLeadsForQuery(campaign: any, queryData: QueryData, targetCount: number, sweepId?: string, sweepDate?: Date): Promise<number> {
    let leadsFound = 0;
    try {
        if (!campaign || campaign.status !== 'ACTIVE') return 0;
        
        // 1. Bulk Scrape - Now using depth (page) for freshness
        const businesses = await scraper.scrape(queryData.query, queryData.country, queryData.page);
        if (!businesses || businesses.length === 0) return 0;

        // 1. Parallel Enrichment (High-Latency Tasks)
        const enrichmentTasks = businesses.slice(0, targetCount).map(async (business) => {
            try {
                const telemetry = `${business.address || ''} | ${business.website || 'No Site'}`;
                const enrichment = await aiService.enrichLead(business.name, business.category ?? undefined, {
                    productDescription: campaign.productDescription,
                    targetPainPoints: campaign.targetPainPoints
                }, telemetry);

                return { business, enrichment };
            } catch (err) {
                return null;
            }
        });

        const enrichedResults = (await Promise.all(enrichmentTasks)).filter(Boolean);

        // 2. Sequential Database Sync (Low-Latency, Anti-Duplicate)
        for (const { business, enrichment } of enrichedResults as any[]) {
            try {
                const user = await prisma.user.findUnique({ where: { id: campaign.userId } });
                if (!user || (user.leadsFoundToday >= user.dailyLimit && user.creditBalance <= 0)) break;

                const cleanName = enrichment.brandName;
                const junkNames = ['unknown', 'unavailable', 'n/a', 'none', 'business', 'company'];
                if (junkNames.includes(cleanName.toLowerCase()) || cleanName.length < 3) continue;

                // --- HUNGRY MODE: Only deep dive if we really think this is a new lead ---
                let hungryEmail = business.email;
                let hungryPhone = business.phone;
                let visualIntel: Buffer | null = null;
                
                // Quick check before expensive deep dive
                const potentialDuplicate = await prisma.business.findFirst({
                    where: { name: cleanName, OR: [{ phone: business.phone || undefined }, { website: business.website || undefined }] }
                });

                if (!potentialDuplicate && business.website && (!hungryEmail || !hungryPhone)) {
                    const deepData = await contactExtractor.extract(business.website);
                    hungryEmail = hungryEmail || deepData.email;
                    hungryPhone = hungryPhone || deepData.phone;
                    visualIntel = deepData.screenshot || null;
                }

                // AI Enrichment with Telemetry & Visual Intel
                const telemetry = `${business.address || ''} | ${business.website || 'No Site'}`;
                const enrichment = await aiService.enrichLead(business.name, business.category ?? undefined, {
                    productDescription: campaign.productDescription,
                    targetPainPoints: campaign.targetPainPoints
                }, telemetry, visualIntel);

                    if (!dbBusiness) {
                        dbBusiness = await tx.business.create({ 
                            data: { name: cleanName, website: business.website, phone: validPhone, email: hungryEmail } 
                        });
                    }

                    const existingLead = await tx.lead.findFirst({ 
                        where: { businessId: dbBusiness.id, campaignId: campaign.id } 
                    });

                    if (existingLead) return null;

                    return await tx.lead.create({
                        data: {
                            campaignId: campaign.id,
                            businessId: dbBusiness.id,
                            industry: enrichment.industry,
                            painPoint: enrichment.painPoint,
                            suggestedMessage: message,
                            sweepId: sweepId,
                            sweepDate: sweepDate
                        }
                    });
                });

                if (result) {
                    await prisma.user.update({ where: { id: user.id }, data: { leadsFoundToday: { increment: 1 } } });
                    leadsFound++;
                    logger.info(`✅ [SECURED] ${cleanName} added to ${campaign.name}`);
                }
            } catch (err) {
                logger.error({ err, business: business.name }, 'Lead sync failed');
            }
        }
        return leadsFound;
    } catch (error) {
        logger.error({ err: error, query: queryData.query }, 'Error in processLeadsForQuery');
        return leadsFound;
    }
}

export async function triggerEngineCycle() {
    logger.info('🚀 HYPER-DRIVE ENGAGED: Starting massive lead extraction cycle...');
    const sweepId = `sweep_${Date.now()}`;
    const sweepDate = new Date();
    const cycleSummary: any[] = [];

    try {
        const activeCampaigns = await prisma.campaign.findMany({
            where: { status: 'ACTIVE' },
            include: { user: true }
        });

        // Parallelize Campaigns
        await Promise.all(activeCampaigns.map(async (campaign) => {
            logger.info(`🛰️  Campaign ${campaign.name}: Initiating parallel sector sweep...`);
            
            // Increase query batch for massive extraction (up to 50 queries per cycle)
            const queries = await queryGenerator.generateBatchQueries(50, campaign);
            let campaignTotal = 0;

            // Process queries in chunks to avoid slamming API/Memory
            const queryChunks = [];
            for (let i = 0; i < queries.length; i += CONCURRENCY_LIMIT) {
                queryChunks.push(queries.slice(i, i + CONCURRENCY_LIMIT));
            }

            for (const chunk of queryChunks) {
                const chunkResults = await Promise.all(
                    chunk.map(query => processLeadsForQuery(campaign, query, 15, sweepId, sweepDate))
                );
                campaignTotal += chunkResults.reduce((a, b) => a + b, 0);
            }

            if (campaignTotal > 0) {
                const magicLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/leads?campaignId=${campaign.id}`;
                logger.info(`✅ [COMPLETED] ${campaign.name}: Secured ${campaignTotal} high-fidelity leads. Repo: ${magicLink}`);
            }
            cycleSummary.push({ campaign: campaign.name, count: campaignTotal });
        }));

        await cleanupDatabase();
        logger.info('🏁 Cycle complete. All intelligence synchronized.');
        return cycleSummary;
    } catch (error) {
        logger.error({ err: error }, 'Massive engine cycle failed');
        throw error;
    }
}
