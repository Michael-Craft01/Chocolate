import 'dotenv/config';
import cron from 'node-cron';
import { queryGenerator, QueryData } from './services/queryGenerator.js';
import { scraper } from './services/scraper.js';
import { aiService } from './services/aiService.js';
import { messageGenerator } from './services/messageGenerator.js';
import { discordDispatcher } from './services/discordDispatcher.js';
import prisma from './lib/prisma.js';
import { logger } from './lib/logger.js';
import { config } from './config.js';
import { cleanupDatabase } from './services/databaseCleanup.js';
import { startServer } from './web/server.js';

const LEADS_PER_COUNTRY = 200;

/**
 * Score a lead based on contact info completeness
 * @returns 0-3 score (phone, email, website each add 1 point)
 */
function scoreLead(lead: { phone?: string | null; email?: string | null; website?: string | null }): number {
    let score = 0;
    if (lead.phone) score++;
    if (lead.email) score++;
    if (lead.website) score++;
    return score;
}

async function processLeadsForQuery(campaign: any, queryData: QueryData, targetCount: number): Promise<number> {
    let leadsFound = 0;

    try {
        if (!campaign || campaign.status !== 'ACTIVE') {
            logger.warn(`Campaign is not active, skipping...`);
            return 0;
        }

        logger.info(`Scraping for campaign "${campaign.name}": "${queryData.query}" (${queryData.country})`);

        const businesses = await scraper.scrape(queryData.query, queryData.country);

        for (const business of businesses) {
            if (leadsFound >= targetCount) break;

            // Check collective user quota + credits
            const user = await prisma.user.findUnique({ where: { id: campaign.userId } });
            if (!user) break;

            if (user.leadsFoundToday >= user.dailyLimit && user.creditBalance <= 0) {
                logger.info(`User ${user.email} reached daily limit and has no credits. Stopping campaign ${campaign.name}.`);
                break;
            }

            // Validate phone number (Robust & Global)
            let validPhone = business.phone;
            if (validPhone) {
                let digits = validPhone.replace(/\D/g, '');
                // Basic global normalization: If starts with 0 and we have a country code
                if (validPhone.trim().startsWith('0') && queryData.country) {
                    // Mapping for common target countries (easily expandable)
                    const prefixes: Record<string, string> = { 'ZW': '263', 'SA': '27', 'UK': '44', 'US': '1' };
                    const prefix = prefixes[queryData.country.toUpperCase()];
                    if (prefix) digits = prefix + digits.substring(1);
                }
                validPhone = digits.length >= 7 ? '+' + digits : null;
            }

            if (!validPhone && !business.email) continue;

            let dbBusiness = await prisma.business.findFirst({
                where: {
                    name: business.name,
                    OR: [
                        { phone: validPhone || undefined },
                        { website: business.website || undefined }
                    ]
                },
            });

            if (!dbBusiness) {
                dbBusiness = await prisma.business.findFirst({ where: { name: business.name } });
            }

            if (!dbBusiness) {
                dbBusiness = await prisma.business.create({
                    data: { name: business.name, website: business.website, phone: validPhone },
                });
            }

            if (!dbBusiness || !dbBusiness.id) continue;

            // Cooldown check
            const existingLead = await prisma.lead.findFirst({
                where: { businessId: dbBusiness.id, campaignId: campaign.id },
                orderBy: { createdAt: 'desc' }
            });

            if (existingLead) {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                if (existingLead.dispatchedAt && existingLead.dispatchedAt > thirtyDaysAgo) {
                    continue;
                }
            }

            // AI Enrichment (Robust)
            const enrichment = await aiService.enrichLead(
                business.name, 
                business.category ?? undefined,
                {
                    productDescription: campaign.productDescription,
                    targetPainPoints: campaign.targetPainPoints
                }
            );

            // Generate Message (Context-Aware)
            const message = messageGenerator.generate(
                campaign,
                business.name,
                enrichment.industry,
                enrichment.painPoint,
                enrichment.recommendedSolution
            );

            // Use credit if above limit
            let usedCredit = false;
            if (user.leadsFoundToday >= user.dailyLimit && user.creditBalance > 0) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { creditBalance: { decrement: 1 } }
                });
                usedCredit = true;
                logger.debug(`Used 1 overage credit for user ${user.email}`);
            }

            // Save Lead
            const lead = await prisma.lead.create({
                data: {
                    campaignId: campaign.id,
                    businessId: dbBusiness.id,
                    industry: enrichment.industry,
                    painPoint: enrichment.painPoint,
                    suggestedMessage: message,
                },
            });

            // Increment lead count for user
            await prisma.user.update({
                where: { id: user.id },
                data: { leadsFoundToday: { increment: 1 } }
            });

            const leadScore = scoreLead({ phone: validPhone, email: business.email, website: business.website });
            const tier: 'hot' | 'warm' = leadScore >= 2 ? 'hot' : 'warm';

            // Dispatch (Multi-tenant)
            const dispatched = await discordDispatcher.dispatch({
                name: business.name,
                industry: enrichment.industry,
                painPoint: enrichment.painPoint,
                recommendedSolution: enrichment.recommendedSolution,
                message: message,
                website: business.website,
                phone: validPhone,
                email: business.email,
                location: `${queryData.location}, ${queryData.country}`,
            }, tier, campaign.discordWebhook);

            if (dispatched) {
                await prisma.lead.update({
                    where: { id: lead.id },
                    data: { dispatchedAt: new Date() },
                });
            }

            leadsFound++;
        }
    } catch (error) {
        logger.error({ err: error }, `Error processing query for campaign ${campaign.id}`);
    }

    return leadsFound;
}

export async function triggerEngineCycle() {
    logger.info('--- Triggered Multi-Tenant Engine Sweep ---');

    await cleanupDatabase();

    try {
        // Fetch a batch of active campaigns to process
        // We order by updatedAt to ensure fairness among campaigns
        const activeCampaigns = await prisma.campaign.findMany({
            where: {
                status: 'ACTIVE',
                user: {
                    paymentStatus: {
                        in: ['active', 'free', 'trialing']
                    }
                }
            },
            include: { user: true },
            orderBy: { updatedAt: 'asc' },
            take: config.MAX_CAMPAIGNS_PER_SWEEP
        });

        if (activeCampaigns.length === 0) {
            logger.info('No active campaigns found in this sweep.');
            return { processed: 0, leads: 0 };
        }

        let totalLeadsFound = 0;

        for (const campaign of activeCampaigns) {
            const user = campaign.user;
            const remainingQuota = Math.max(0, user.dailyLimit - user.leadsFoundToday);
            const totalAvailable = remainingQuota + user.creditBalance;

            if (totalAvailable <= 0) {
                logger.info(`User ${user.email} exhausted budget. Skipping campaign ${campaign.name}.`);
                continue;
            }

            logger.info(`Sweeping campaign: ${campaign.name} for user: ${user.email} (Budget: ${totalAvailable} leads)`);

            // Generate queries
            const queries = await queryGenerator.generateBatchQueries(totalAvailable, campaign);

            let campaignLeads = 0;
            for (const queryData of queries) {
                if (campaignLeads >= totalAvailable) break;
                const found = await processLeadsForQuery(campaign, queryData, totalAvailable - campaignLeads);
                campaignLeads += found;
            }

            // Update campaign timestamp to move it to end of queue for next sweep
            await prisma.campaign.update({
                where: { id: campaign.id },
                data: { updatedAt: new Date() }
            });

            totalLeadsFound += campaignLeads;
        }

        logger.info(`--- Sweep Complete: ${activeCampaigns.length} campaigns, ${totalLeadsFound} leads ---`);
        return { processed: activeCampaigns.length, leads: totalLeadsFound };
    } catch (error) {
        logger.error({ err: error }, 'Error in Engine sweep:');
        throw error;
    }
}

// Reset daily quotas at midnight
cron.schedule('0 0 * * *', async () => {
    logger.info('Resetting daily lead quotas...');
    await prisma.user.updateMany({
        data: { leadsFoundToday: 0, lastQuotaReset: new Date() }
    });
});

// Server Initialization
if (process.env.RUN_ONCE === 'true') {
    triggerEngineCycle().then(() => process.exit(0)).catch(() => process.exit(1));
} else {
    // Start the Web Server (Webhook trigger lives here)
    startServer();
}
