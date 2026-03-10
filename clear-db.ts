import prisma from './src/lib/prisma.js';
import { logger } from './src/lib/logger.js';

async function clearDatabase() {
    try {
        logger.info('Deleting all data from database...');

        // Order matters due to foreign keys
        await prisma.lead.deleteMany({});
        await prisma.queryHistory.deleteMany({});
        await prisma.business.deleteMany({});

        logger.info('Database cleared successfully.');
    } catch (error) {
        logger.error({ err: error }, 'Failed to clear database:');
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

clearDatabase();
