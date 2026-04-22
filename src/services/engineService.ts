import { queryGenerator, QueryData } from './queryGenerator.js';
import { scraper } from './scraper.js';
import { aiService } from './aiService.js';
import { messageGenerator } from './messageGenerator.js';
import { dispatchService } from './dispatchService.js';
import { cleanupDatabase } from './databaseCleanup.js';
import prisma from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

async function processLeadsForQuery(campaign: any, queryData: QueryData, targetCount: number, sweepId?: string, sweepDate?: Date): Promise<number> {
    let leadsFound = 0;
    try {
        if (!campaign || campaign.status !== 'ACTIVE') return 0;
        const businesses = await scraper.scrape(queryData.query, queryData.country);
        
        for (const business of businesses) {
            if (leadsFound >= targetCount) break;
            const user = await prisma.user.findUnique({ where: { id: campaign.userId } });
            if (!user || (user.leadsFoundToday >= user.dailyLimit && user.creditBalance <= 0)) break;

            let validPhone = business.phone;
            if (validPhone) {
                let digits = validPhone.replace(/\D/g, '');
                const prefixes: Record<string, string> = { 'ZW': '263', 'SA': '27', 'UK': '44', 'US': '1' };
                const prefix = prefixes[queryData.country.toUpperCase()];
                if (prefix && validPhone.trim().startsWith('0')) digits = prefix + digits.substring(1);
                validPhone = digits.length >= 7 ? '+' + digits : null;
            }

            // 1. Enrich Lead OUTSIDE the transaction (Gemini takes time)
            const enrichment = await aiService.enrichLead(business.name, business.category ?? undefined, {
                productDescription: campaign.productDescription,
                targetPainPoints: campaign.targetPainPoints
            });

            const message = messageGenerator.generate(campaign, business.name, enrichment.industry, enrichment.painPoint, enrichment.recommendedSolution);

            // 2. Atomic Save INSIDE the transaction
            const result = await prisma.$transaction(async (tx) => {
                let dbBusiness = await tx.business.findFirst({
                    where: { 
                        name: business.name, 
                        OR: [
                            { phone: validPhone || undefined }, 
                            { website: business.website || undefined }
                        ] 
                    }
                });

                if (!dbBusiness) {
                    dbBusiness = await tx.business.create({ 
                        data: { 
                            name: business.name, 
                            website: business.website, 
                            phone: validPhone 
                        } 
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
            }, { timeout: 10000 }); // Extra safety buffer

            if (result) {
                await prisma.user.update({ where: { id: user.id }, data: { leadsFoundToday: { increment: 1 } } });
                leadsFound++;
                console.log(`✅ Processed and saved lead: ${business.name}`);
            }
        }
        return leadsFound;
    } catch (error) {
        logger.error({ err: error }, 'Error in processLeadsForQuery');
        return leadsFound;
    }
}

export async function triggerEngineCycle() {
    logger.info('🚀 Starting global lead engine cycle...');
    const results: any[] = [];
    const sweepSummary: Map<string, { count: number, campaign: any }> = new Map();
    const sweepId = `sweep_${Date.now()}`;
    const sweepDate = new Date();

    try {
        const activeCampaigns = await prisma.campaign.findMany({
            where: { status: 'ACTIVE' },
            include: { user: true }
        });

        for (const campaign of activeCampaigns) {
            const queries = await queryGenerator.generateBatchQueries(25, campaign);
            let totalNewLeads = 0;
            for (const queryData of queries) {
                const found = await processLeadsForQuery(campaign, queryData, 5, sweepId, sweepDate);
                totalNewLeads += found;
            }
            if (totalNewLeads > 0) sweepSummary.set(campaign.id, { count: totalNewLeads, campaign });
            results.push({ campaign: campaign.name, leadsFound: totalNewLeads });
        }

        for (const [campaignId, summary] of sweepSummary.entries()) {
            const magicSheetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/leads?campaignId=${campaignId}`;
            logger.info(`[SUMMARY] Sweep report for ${summary.campaign.user.email}: ${summary.count} leads. Link: ${magicSheetLink}`);
        }

        await cleanupDatabase();
        return results;
    } catch (error) {
        logger.error({ err: error }, 'Engine cycle failed');
        throw error;
    }
}
