import prisma from './lib/prisma';
import { logger } from './lib/logger';
import { startServer } from './web/server';
import { triggerEngineCycle } from './services/discoveryEngine';

// Configuration
const CYCLE_INTERVAL = 12 * 60 * 60 * 1000; // 12 hours (2 cycles a day)

async function startEngine() {
    logger.info('🚀 Starting Autonomous Lead Generation Engine...');
    
    // 1. Start Web UI/API
    startServer();

    // 2. Initial Hunt (Only if active campaigns exist)
    const activeCount = await prisma.campaign.count({ where: { status: 'ACTIVE' } });
    
    if (activeCount > 0) {
        logger.info(`Found ${activeCount} active campaigns. Performing initial lead sweep...`);
        await triggerEngineCycle().catch(err => logger.error({ err }, 'Initial sweep failed'));
    } else {
        logger.info('Engine Standby: No active campaigns found. Waiting for user to launch a mission.');
    }

    // 3. Schedule Recurring Hunts
    setInterval(async () => {
        try {
            await triggerEngineCycle();
        } catch (error) {
            logger.error({ err: error }, 'Scheduled sweep failed');
        }
    }, CYCLE_INTERVAL);

    logger.info(`Engine operational. Next sweep in ${CYCLE_INTERVAL / (60 * 60 * 1000)} hours.`);
}

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
    logger.error({ reason, promise }, 'Unhandled Rejection at Promise');
});

startEngine().catch(err => {
    logger.error({ err }, 'Engine failed to start');
    process.exit(1);
});
