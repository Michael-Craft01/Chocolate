import prisma from './lib/prisma.js';
import { logger } from './lib/logger.js';
import { startServer } from './web/server.js';
import { createAndRunCampaignCycle } from './services/discoveryEngine.js';
import { config } from './config.js';
import cron from 'node-cron';

// Configuration
const CYCLE_INTERVAL = 12 * 60 * 60 * 1000; // Lightweight AC-BDE scheduler check

function isCycleDue(user: { automationMode: string; autoRunFrequency: string }, lastCycle?: { createdAt: Date; status: string; leadsFound: number; maxLeads: number } | null) {
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
                paymentStatus: { in: ['active', 'trialing'] },
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

async function startEngine() {
    logger.info('🚀 Starting Autonomous Lead Generation Engine...');
    
    // 1. Start Web UI/API
    startServer();

    // 2. Initial cycle queue (only if paid work exists)
    const activeCount = await prisma.campaign.count({ where: { status: 'ACTIVE' } });
    
    if (activeCount > 0) {
        logger.info(`Found ${activeCount} active campaigns. Queueing due discovery cycles...`);
        await queueDueDiscoveryCycles('SYSTEM').catch((err: any) => logger.error({ err }, 'Initial cycle queue failed'));
    } else {
        logger.info('Engine Standby: No active campaigns found. Waiting for user to launch a mission.');
    }

    // 3. Schedule Recurring Hunts with node-cron
    const cronSchedule = config.CRON_SCHEDULE || '0 */6 * * *';
    cron.schedule(cronSchedule, async () => {
        logger.info('⏰ Running scheduled campaign cycle sweep...');
        try {
            const queued = await queueDueDiscoveryCycles('AUTO');
            logger.info(`AC-BDE scheduler check complete. Queued ${queued} campaign cycle(s).`);
        } catch (error: any) {
            logger.error({ err: error }, 'Scheduled cycle queue failed');
        }
    });

    logger.info(`Engine operational. Scheduler configured via cron: "${cronSchedule}"`);
}

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
    logger.error({ reason, promise }, 'Unhandled Rejection at Promise');
});

startEngine().catch((err: any) => {
    logger.error({ err }, 'Engine failed to start');
    process.exit(1);
});
