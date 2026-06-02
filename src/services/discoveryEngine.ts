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

async function syncLeadToDb(business: any, enrichment: any, campaign: any, sweepId?: string, sweepDate?: Date, cycleRunId?: string) {
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

        // Vital Check: Ensure campaign still exists (prevents Ghost Loop errors after Nuclear Purge)
        const campaignExists = await tx.campaign.findUnique({ where: { id: campaign.id } });
        if (!campaignExists) {
            logger.warn(`⚠️ [GHOST] Aborting sync. Campaign ${campaign.id} no longer exists.`);
            return null;
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
                cycleRunId: cycleRunId || null,
                sweepId: sweepId || null,
                sweepDate: sweepDate || null
            }
        });

        logger.info(`✅ [SYNC] Lead saved successfully: ${cleanName} for Campaign: ${campaign.name}`);
        return newLead;
    });
}

export async function processLeadsForQuery(campaign: any, queryData: QueryData, targetCount: number, sweepId?: string, sweepDate?: Date, cycleRunId?: string): Promise<number> {
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
                            () => contactExtractor.extract(business.website!),
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

                const result = await syncLeadToDb(business, enrichment, campaign, sweepId, sweepDate, cycleRunId);
                if (result) {
                    await prisma.user.update({ where: { id: user.id }, data: { leadsFoundToday: { increment: 1 } } });
                    user.leadsFoundToday++; 
                    leadsFound++;

                    // Safe, non-blocking auto-dispatch outside of database transactions
                    if (campaign.discordWebhook) {
                        dispatchService.dispatchLeadToDiscord(result, campaign).catch(e => {
                            logger.error({ err: e.message }, `Failed to auto-dispatch lead ${result.id} to Discord`);
                        });
                    }
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

// ══════════════════════════════════════════════════════════════════════════
//  SINGLE PASS — processes every active campaign once toward its daily quota
// ══════════════════════════════════════════════════════════════════════════
export async function triggerEngineCycle() {
    logger.info('🚀 Cycle pass start');
    const cycleSummary: { campaign: string, count: number }[] = [];

    // ── QUOTA RESET PROTOCOL ──
    try {
        const now = new Date();
        const threshold = new Date(now.getTime() - 23 * 60 * 60 * 1000); // 23h tolerance
        await prisma.user.updateMany({
            where: { lastQuotaReset: { lt: threshold } },
            data: { leadsFoundToday: 0, lastQuotaReset: now }
        });
        logger.info('🔄 Daily quotas reset checked');
    } catch (e: any) {
        logger.error({ err: e.message }, 'Quota reset failed');
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
                logger.warn(`⚠️ [QUALITY GUARD] Campaign "${campaign.name}" skipped: identity incomplete.`);
                continue;
            }

            // Always re-fetch user so leadsFoundToday is fresh for each campaign
            const user = await prisma.user.findUnique({ where: { id: campaign.userId } });
            if (!user) continue;

            // ── FAIR SHARE QUOTA SPLITTING ──
            const userActiveCampaigns = activeCampaigns.filter(c => c.userId === user.id);
            const dailyRemaining = user.dailyLimit - user.leadsFoundToday;

            // 80% per pass — aggressive to hit tier quotas faster
            const totalPassTarget = Math.ceil(user.dailyLimit * 0.8);
            const passTargetForUser = Math.min(totalPassTarget, dailyRemaining);
            const target = Math.max(1, Math.floor(passTargetForUser / userActiveCampaigns.length));

            if (target <= 0 || dailyRemaining <= 0) {
                logger.info(`⏹️ [QUOTA] "${campaign.name}" skipped: limit reached (${user.leadsFoundToday}/${user.dailyLimit}).`);
                continue;
            }

            let campaignTotal = 0;
            let round = 0;
            const MAX_ROUNDS = 25;

            logger.info(`🎯 "${campaign.name}" — Pass target: ${target} | Daily: ${user.leadsFoundToday}/${user.dailyLimit}`);

            while (campaignTotal < target && round < MAX_ROUNDS) {
                round++;
                logger.info(`🔄 Round ${round} — need ${target - campaignTotal} more for "${campaign.name}"`);

                const queries = await queryGenerator.generateBatchQueries(20, campaign);
                if (queries.length === 0) break;

                for (const query of queries) {
                    const stillNeeded = target - campaignTotal;
                    if (stillNeeded <= 0) break;

                    const count = await processLeadsForQuery(campaign, query, Math.min(20, stillNeeded), sweepId, sweepDate);
                    campaignTotal += count;
                    await sleep(1000);
                }
            }

            if (!userResults[campaign.userId]) userResults[campaign.userId] = [];
            userResults[campaign.userId]!.push({ campaignName: campaign.name, count: campaignTotal });
            cycleSummary.push({ campaign: campaign.name, count: campaignTotal });
        }

        // Send summaries only to users without Discord webhook
        for (const [userId, results] of Object.entries(userResults)) {
            const hasDiscord = await prisma.campaign.findFirst({
                where: { userId, NOT: [{ discordWebhook: null }, { discordWebhook: '' }] }
            });
            if (!hasDiscord) {
                await dispatchService.sendUserCycleSummary(userId, results)
                    .catch(e => logger.error({ err: e.message }, 'Failed to send summary email'));
            } else {
                logger.info(`[SUMMARY] Skipping summary email for user ${userId} — Discord webhook active.`);
            }
        }

        await cleanupDatabase();
        return cycleSummary;
    } catch (error) {
        logger.error({ error }, 'Cycle pass failed');
        throw error;
    }
}

// ══════════════════════════════════════════════════════════════════════════
//  PERSISTENT QUOTA RUNNER — loops until every active user's daily limit
//  is filled OR the safety time-wall (MAX_RUN_HOURS) is reached.
//
//  This GUARANTEES tier-based lead delivery. Call this once per day.
// ══════════════════════════════════════════════════════════════════════════
export async function runCampaignCycle(cycleRunId: string) {
    const cycle = await prisma.cycleRun.findUnique({
        where: { id: cycleRunId },
        include: { campaign: { include: { user: true } }, user: true }
    });

    if (!cycle) throw new Error(`CycleRun ${cycleRunId} not found`);
    if (cycle.status === 'RUNNING') {
        logger.warn({ cycleRunId }, '[CYCLE] Cycle is already running');
        return cycle;
    }
    if (cycle.status === 'COMPLETED') {
        logger.info({ cycleRunId }, '[CYCLE] Cycle already completed');
        return cycle;
    }

    const campaign = cycle.campaign;
    const user = cycle.user;

    if (campaign.status !== 'ACTIVE') {
        return prisma.cycleRun.update({
            where: { id: cycleRunId },
            data: { status: 'FAILED', failureReason: 'Campaign is not active', completedAt: new Date() }
        });
    }

    if (user.paymentStatus !== 'active' && user.paymentStatus !== 'trialing') {
        return prisma.cycleRun.update({
            where: { id: cycleRunId },
            data: { status: 'FAILED', failureReason: 'User does not have an active subscription', completedAt: new Date() }
        });
    }

    const isIdentityComplete =
        campaign.productDescription?.length > 10 &&
        campaign.targetPainPoints?.length > 5 &&
        campaign.locations.length > 0 &&
        campaign.industries.length > 0;

    if (!isIdentityComplete) {
        return prisma.cycleRun.update({
            where: { id: cycleRunId },
            data: { status: 'FAILED', failureReason: 'Campaign identity is incomplete', completedAt: new Date() }
        });
    }

    const startedAt = new Date();
    const deadline = startedAt.getTime() + cycle.maxRuntimeMs;
    const sweepId = cycle.id;
    let leadsFound = 0;
    let zeroYieldRounds = 0;
    const MAX_ZERO_YIELD_ROUNDS = 3;
    let abortedDueToPause = false;

    await prisma.cycleRun.update({
        where: { id: cycleRunId },
        data: { status: 'RUNNING', startedAt, failureReason: null }
    });

    try {
        logger.info({ cycleRunId, campaignId: campaign.id, maxLeads: cycle.maxLeads }, '[CYCLE] Starting bounded campaign cycle');

        while (leadsFound < cycle.maxLeads && Date.now() < deadline && zeroYieldRounds < MAX_ZERO_YIELD_ROUNDS) {
            // Check if campaign was paused or deactivated
            const currentCampaign = await prisma.campaign.findUnique({
                where: { id: campaign.id },
                select: { status: true }
            });
            if (!currentCampaign || currentCampaign.status !== 'ACTIVE') {
                logger.info({ cycleRunId }, '[CYCLE] Campaign was paused or deactivated. Aborting cycle.');
                abortedDueToPause = true;
                break;
            }

            const stillNeeded = cycle.maxLeads - leadsFound;
            const queries = await queryGenerator.generateBatchQueries(Math.min(10, Math.max(3, stillNeeded)), campaign);
            if (queries.length === 0) break;

            let roundFound = 0;
            for (const query of queries) {
                // Check if campaign was paused inside inner loop
                const innerCampaign = await prisma.campaign.findUnique({
                    where: { id: campaign.id },
                    select: { status: true }
                });
                if (!innerCampaign || innerCampaign.status !== 'ACTIVE' || leadsFound >= cycle.maxLeads || Date.now() >= deadline) {
                    abortedDueToPause = true;
                    break;
                }

                const count = await processLeadsForQuery(
                    campaign,
                    query,
                    Math.min(10, cycle.maxLeads - leadsFound),
                    sweepId,
                    startedAt,
                    cycleRunId
                );

                leadsFound += count;
                roundFound += count;

                await prisma.cycleRun.update({
                    where: { id: cycleRunId },
                    data: { leadsFound }
                });

                await sleep(1000);
            }

            if (abortedDueToPause) break;

            zeroYieldRounds = roundFound === 0 ? zeroYieldRounds + 1 : 0;
            if (roundFound === 0) await sleep(30000);
        }

        if (abortedDueToPause) {
            logger.info({ cycleRunId }, '[CYCLE] Campaign paused. Leaving cycle run status untouched.');
            return await prisma.cycleRun.findUnique({ where: { id: cycleRunId } });
        }

        const status = leadsFound > 0 || Date.now() < deadline ? 'COMPLETED' : 'PARTIAL';
        const completed = await prisma.cycleRun.update({
            where: { id: cycleRunId },
            data: { status, leadsFound, completedAt: new Date() }
        });

        logger.info({ cycleRunId, leadsFound, status }, '[CYCLE] Bounded campaign cycle finished');
        return completed;
    } catch (error: any) {
        logger.error({ error, cycleRunId }, '[CYCLE] Bounded campaign cycle failed');
        return prisma.cycleRun.update({
            where: { id: cycleRunId },
            data: {
                status: 'FAILED',
                leadsFound,
                failureReason: error.message || 'Unknown cycle failure',
                completedAt: new Date()
            }
        });
    }
}

export async function createAndRunCampaignCycle(campaignId: string, userId: string, triggerType: 'AUTO' | 'MANUAL' | 'SYSTEM' = 'MANUAL') {
    const campaign = await prisma.campaign.findFirst({
        where: {
            id: campaignId,
            userId,
            status: 'ACTIVE',
            user: {
                paymentStatus: { in: ['active', 'trialing'] },
                cyclesRemaining: { gt: 0 }
            }
        },
        include: { user: true }
    });

    if (!campaign) {
        throw new Error('No active campaign with remaining cycles found');
    }

    const isIdentityComplete =
        campaign.productDescription?.length > 10 &&
        campaign.targetPainPoints?.length > 5 &&
        campaign.locations.length > 0 &&
        campaign.industries.length > 0;

    if (!isIdentityComplete) {
        throw new Error('Campaign identity is incomplete. Add product details, pain points, industries, and locations before running a cycle.');
    }

    const activeCycle = await prisma.cycleRun.findFirst({
        where: {
            campaignId,
            userId,
            status: { in: ['QUEUED', 'RUNNING'] }
        },
        select: { id: true }
    });

    if (activeCycle) {
        throw new Error('A discovery cycle is already queued or running for this campaign');
    }

    const claimed = await prisma.user.updateMany({
        where: {
            id: userId,
            cyclesRemaining: { gt: 0 },
            paymentStatus: { in: ['active', 'trialing'] }
        },
        data: { cyclesRemaining: { decrement: 1 } }
    });

    if (claimed.count !== 1) {
        throw new Error('No discovery cycles remaining');
    }

    const cycle = await prisma.cycleRun.create({
        data: {
            userId,
            campaignId,
            triggerType,
            maxLeads: campaign.user.leadsPerCycle || 10,
            maxRuntimeMs: 15 * 60 * 1000
        }
    });

    runCampaignCycle(cycle.id).catch(err => logger.error({ err, cycleRunId: cycle.id }, '[CYCLE] Background cycle failed'));
    return cycle;
}

export async function runUntilQuotaFilled() {
    const MAX_RUN_HOURS = 8;       // Hard safety wall — never run longer than 8 hours
    const PASS_COOLDOWN_MS = 5000; // 5-second breath between passes
    const startTime = Date.now();
    const deadline = startTime + MAX_RUN_HOURS * 60 * 60 * 1000;

    let passNumber = 0;
    let totalLeadsAllPasses = 0;

    logger.info(`🏁 [QUOTA RUNNER] Starting. Will stop when all quotas filled or after ${MAX_RUN_HOURS}h.`);

    while (Date.now() < deadline) {
        passNumber++;
        logger.info(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        logger.info(`📦 [QUOTA RUNNER] Pass #${passNumber} starting...`);
        logger.info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

        // Check upfront if all active users have already filled their quota
        const usersWithActiveQuota = await prisma.user.findMany({
            where: {
                paymentStatus: 'active',
                campaigns: { some: { status: 'ACTIVE' } }
            },
            select: { id: true, email: true, dailyLimit: true, leadsFoundToday: true }
        });

        const unfilled = usersWithActiveQuota.filter(u => u.leadsFoundToday < u.dailyLimit);

        if (unfilled.length === 0) {
            logger.info(`🎉 [QUOTA RUNNER] All users have hit their daily limits! Stopping after ${passNumber - 1} passes.`);
            break;
        }

        logger.info(`[QUOTA RUNNER] ${unfilled.length} user(s) still need leads:`);
        for (const u of unfilled) {
            logger.info(`  ➤ ${u.email}: ${u.leadsFoundToday}/${u.dailyLimit} (${u.dailyLimit - u.leadsFoundToday} remaining)`);
        }

        // Run a single pass of the engine
        const passResults = await triggerEngineCycle();
        const passTotal = passResults.reduce((sum, r) => sum + r.count, 0);
        totalLeadsAllPasses += passTotal;

        const elapsedMins = Math.round((Date.now() - startTime) / 60000);
        logger.info(`✅ [QUOTA RUNNER] Pass #${passNumber} done. +${passTotal} leads | Total: ${totalLeadsAllPasses} | Elapsed: ${elapsedMins}min`);

        if (passTotal === 0) {
            // Zero leads means scraper is hitting CAPTCHA/throttling — back off before retrying
            logger.warn(`⚠️ [QUOTA RUNNER] Zero leads this pass — backing off 2 minutes before retrying...`);
            await sleep(120000);
        } else {
            await sleep(PASS_COOLDOWN_MS);
        }
    }

    if (Date.now() >= deadline) {
        logger.warn(`⏰ [QUOTA RUNNER] Safety time-wall reached (${MAX_RUN_HOURS}h). Stopping to protect resources.`);
    }

    logger.info(`🏁 [QUOTA RUNNER] Done. Total: ${totalLeadsAllPasses} leads across ${passNumber} passes.`);
    return totalLeadsAllPasses;
}
