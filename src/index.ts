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
                paymentStatus: { in: ['active', 'trialing', 'free'] },
                cyclesRemaining: { gt: 0 },
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

        const activeCount = await prisma.campaign.count({ where: { status: 'ACTIVE' } });

        if (activeCount > 0) {
            logger.info(`Found ${activeCount} active campaigns. Queueing due discovery cycles...`);
            const queued = await queueDueDiscoveryCycles('SYSTEM');
            logger.info(`Sweep complete. Queued ${queued} campaign cycle(s).`);
        } else {
            logger.info('Standby: No active campaigns found.');
        }

        await prisma.$disconnect();
        process.exit(0);
    }

    // ── Mode C: Long-running server (local dev / Railway / Fly.io) ────────────
    logger.info('🚀 Starting Autonomous Lead Generation Engine (server mode)...');

    // Clean up stale cycles on boot to release any blocks
    await cleanupStaleCycles(true).catch((err: any) => logger.error({ err }, 'Stale cycle cleanup failed on startup'));

    // 1. Start Web UI/API
    startServer();

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
