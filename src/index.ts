import 'dotenv/config';
import { logger } from './lib/logger.js';
import { startServer } from './web/server.js';
import { triggerEngineCycle } from './services/discoveryEngine.js';

// Configuration
const CYCLE_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours

async function startEngine() {
    logger.info('🚀 Starting Autonomous Lead Generation Engine...');
    
    // 1. Start Web UI/API
    startServer();

    // 2. Initial Hunt
    logger.info('Performing initial lead sweep...');
    await triggerEngineCycle().catch(err => logger.error({ err }, 'Initial sweep failed'));

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
