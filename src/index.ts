import prisma from './lib/prisma.js';
import { logger } from './lib/logger.js';
import { startServer } from './web/server.js';
import { createAndRunCampaignCycle, runCampaignCycle } from './services/discoveryEngine.js';
import { config } from './config.js';
import cron from 'node-cron';
import { cleanupStaleCycles } from './services/databaseCleanup.js';

// ── GitHub Actions / CI mode flags ───────────────────────────────────────────
// RUN_ONCE=true  → run a single sweep then exit (used in scheduled GH Actions)
// CAMPAIGN_ID=id → run only a specific campaign (used in repository_dispatch)
// CYCLE_RUN_ID=id → pre-created cycle record to update (from Vercel dispatch)
const RUN_ONCE = process.env.RUN_ONCE === 'true';
const TARGET_CAMPAIGN_ID = process.env.CAMPAIGN_ID?.trim() || '';
const CYCLE_RUN_ID = process.env.CYCLE_RUN_ID?.trim() || '';

// ── Scheduling helpers ───────────────────────────────────────────────────────
const CYCLE_INTERVAL = 12 * 60 * 60 * 1000; // not used for GH Actions

function isCycleDue(
    user: { automationMode: string; autoRunFrequency: string },
    lastCycle?: { createdAt: Date; status: string; leadsFound: number; maxLeads: number } | null
) {
    if (user.automationMode === 'MANUAL' || user.autoRunFrequency === 'MANUAL') return false;

    if (user.automationMode === 'SMART' && lastCycle) {
        const yieldRatio = lastCycle.maxLeads > 0 ? lastCycle.leadsFound / lastCycle.maxLeads : 0;
        if (lastCycle.status === 'FAILED' || yieldRatio < 0.2) return false;
    }

    if (!lastCycle) return true;

    const elapsedMs = Date.now() - lastCycle.createdAt.getTime();
    const requiredMs =
        user.autoRunFrequency === 'DAILY' ? 24 * 60 * 60 * 1000 :
        user.autoRunFrequency === 'EVERY_2_DAYS' ? 2 * 24 * 60 * 60 * 1000 :
        user.autoRunFrequency === 'WEEKLY' ? 7 * 24 * 60 * 60 * 1000 :
        Number.POSITIVE_INFINITY;

    return elapsedMs >= requiredMs;
}

async function queueDueDiscoveryCycles(triggerType: 'AUTO' | 'SYSTEM' = 'AUTO') {
    const campaigns = await prisma.campaign.findMany({
        where: {
            status: 'ACTIVE',
            user: {
                automationMode: { in: ['AUTOMATIC', 'SMART'] }
            }
        },
        select: {
            id: true,
            userId: true,
            user: { select: { automationMode: true, autoRunFrequency: true } },
            cycleRuns: {
                orderBy: { createdAt: 'desc' },
                take: 1,
                select: { createdAt: true, status: true, leadsFound: true, maxLeads: true }
            }
        }
    });

    let queued = 0;
    for (const campaign of campaigns) {
        if (!isCycleDue(campaign.user, campaign.cycleRuns[0])) continue;

        try {
            await createAndRunCampaignCycle(campaign.id, campaign.userId, triggerType);
            queued++;
        } catch (error: any) {
            logger.warn({ err: error.message, campaignId: campaign.id }, 'Cycle queue skipped');
        }
    }

    return queued;
}

// ── Targeted single-campaign run (used by repository_dispatch) ───────────────
async function runTargetedCampaign(campaignId: string, existingCycleRunId?: string) {
    logger.info(`[Engine] Targeted run for campaign: ${campaignId}`);

    const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        select: { id: true, userId: true, status: true, name: true }
    });

    if (!campaign) {
        logger.error(`[Engine] Campaign ${campaignId} not found.`);
        process.exit(1);
    }

    if (campaign.status !== 'ACTIVE') {
        logger.warn(`[Engine] Campaign "${campaign.name}" is ${campaign.status} — skipping.`);
        process.exit(0);
    }

    try {
        if (existingCycleRunId) {
            await runCampaignCycle(existingCycleRunId);
        } else {
            await createAndRunCampaignCycle(campaign.id, campaign.userId, 'MANUAL');
        }
        logger.info(`[Engine] Targeted run for campaign ${campaignId} complete.`);
    } catch (error: any) {
        logger.error({ err: error }, `[Engine] Targeted run for campaign ${campaignId} failed.`);
        process.exit(1);
    }
}

// ── Main entry point ──────────────────────────────────────────────────────────
async function startEngine() {
    // ── Mode A: GitHub Actions targeted single-campaign dispatch ──────────────
    if (RUN_ONCE && TARGET_CAMPAIGN_ID) {
        logger.info(`🚀 Engine started in TARGETED mode (GitHub Actions dispatch). Campaign: ${TARGET_CAMPAIGN_ID}`);
        await runTargetedCampaign(TARGET_CAMPAIGN_ID, CYCLE_RUN_ID);
        logger.info('✅ Targeted run complete. Exiting.');
        await prisma.$disconnect();
        process.exit(0);
    }

    // ── Mode B: GitHub Actions scheduled sweep ────────────────────────────────
    if (RUN_ONCE) {
        logger.info('🚀 Engine started in RUN_ONCE mode (GitHub Actions scheduled sweep).');
        
        // Clean up stale cycles before queueing
        await cleanupStaleCycles(false).catch((err: any) => logger.error({ err }, 'Stale cycle cleanup failed in sweep run'));

        // 1. Process all QUEUED cycles waiting in database (e.g. from website clicks)
        const queuedRuns = await prisma.cycleRun.findMany({
            where: { status: 'QUEUED' },
            orderBy: { createdAt: 'asc' }
        });

        if (queuedRuns.length > 0) {
            logger.info(`🔄 Found ${queuedRuns.length} QUEUED cycle run(s) from website. Executing sweeps...`);
            for (const run of queuedRuns) {
                try {
                    logger.info(`Executing queued cycle: ${run.id} for campaign: ${run.campaignId}`);
                    await runCampaignCycle(run.id);
                } catch (err: any) {
                    logger.error({ err: err.message, cycleId: run.id }, 'Failed to execute queued cycle');
                }
            }
        }

        // 2. Process active campaigns that are due for a sweep
        const activeCampaigns = await prisma.campaign.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true, userId: true, name: true }
        });

        if (activeCampaigns.length > 0) {
            logger.info(`Found ${activeCampaigns.length} active campaign(s). Checking discovery sweeps...`);
            for (const campaign of activeCampaigns) {
                const activeOrRecent = await prisma.cycleRun.findFirst({
                    where: {
                        campaignId: campaign.id,
                        status: { in: ['RUNNING', 'QUEUED'] }
                    }
                });

                if (activeOrRecent) {
                    logger.info(`Campaign "${campaign.name}" already has an active/queued cycle. Skipping.`);
                    continue;
                }

                const lastCompleted = await prisma.cycleRun.findFirst({
                    where: { campaignId: campaign.id, status: 'COMPLETED' },
                    orderBy: { createdAt: 'desc' }
                });

                // Run if never run or last completed over 6 hours ago
                const shouldSweep = !lastCompleted || (Date.now() - lastCompleted.createdAt.getTime() > 6 * 60 * 60 * 1000);
                if (shouldSweep) {
                    try {
                        logger.info(`Triggering discovery sweep for campaign: "${campaign.name}" (${campaign.id})`);
                        await createAndRunCampaignCycle(campaign.id, campaign.userId, 'SYSTEM');
                    } catch (err: any) {
                        logger.warn({ err: err.message, campaignId: campaign.id }, 'Campaign sweep skipped');
                    }
                }
            }
        } else {
            logger.info('Standby: No active campaigns found in database.');
        }

        logger.info('🏁 All scheduled sweeps and queued cycles finished.');
        await prisma.$disconnect();
        process.exit(0);
    }

    // ── Mode C: Long-running server (local dev / Railway / Fly.io) ────────────
    logger.info('🚀 Starting Autonomous Lead Generation Engine (server mode)...');

    // Clean up stale cycles on boot to release any blocks
    await cleanupStaleCycles(true).catch((err: any) => logger.error({ err }, 'Stale cycle cleanup failed on startup'));

    // 1. Start Web UI/API
    startServer();

    // 1.5 Auto-resume any QUEUED/re-queued cycles in database
    try {
        const queuedRuns = await prisma.cycleRun.findMany({
            where: { status: 'QUEUED' }
        });
        if (queuedRuns.length > 0) {
            logger.info(`🔄 Found ${queuedRuns.length} QUEUED cycle run(s) on startup. Triggering auto-resume...`);
            for (const run of queuedRuns) {
                runCampaignCycle(run.id).catch((err: any) => logger.error({ err, cycleId: run.id }, 'Failed to resume queued cycle on startup'));
            }
        }
    } catch (err: any) {
        logger.error({ err: err.message }, 'Failed to query or resume queued cycles on startup');
    }

    // 2. Initial cycle queue
    const activeCount = await prisma.campaign.count({ where: { status: 'ACTIVE' } });

    if (activeCount > 0) {
        logger.info(`Found ${activeCount} active campaigns. Queueing due discovery cycles...`);
        await queueDueDiscoveryCycles('SYSTEM').catch((err: any) => logger.error({ err }, 'Initial cycle queue failed'));
    } else {
        logger.info('Engine Standby: No active campaigns. Waiting for user to launch a mission.');
    }

    // 3. Schedule recurring sweeps
    const cronSchedule = config.CRON_SCHEDULE || '0 */6 * * *';
    cron.schedule(cronSchedule, async () => {
        logger.info('⏰ Running scheduled campaign cycle sweep...');
        try {
            // Clean up stale cycles periodically
            await cleanupStaleCycles(false).catch((err: any) => logger.error({ err }, 'Stale cycle cleanup failed in cron'));

            const queued = await queueDueDiscoveryCycles('AUTO');
            logger.info(`Scheduler check complete. Queued ${queued} campaign cycle(s).`);
        } catch (error: any) {
            logger.error({ err: error }, 'Scheduled cycle queue failed');
        }
    });

    logger.info(`Engine operational. Cron: "${cronSchedule}"`);
}

process.on('unhandledRejection', (reason, promise) => {
    logger.error({ reason, promise }, 'Unhandled Rejection at Promise');
});

startEngine().catch((err: any) => {
    logger.error({ err }, 'Engine failed to start');
    process.exit(1);
});
