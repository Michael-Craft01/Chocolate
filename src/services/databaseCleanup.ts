import prisma from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

const CLEANUP_DAYS = 14; // Delete records older than 14 days

export async function cleanupDatabase(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CLEANUP_DAYS);

    logger.info(`Running database cleanup (removing records older than ${CLEANUP_DAYS} days)...`);

    try {
        // 1. Delete old leads
        const deletedLeads = await prisma.lead.deleteMany({
            where: {
                createdAt: {
                    lt: cutoffDate,
                },
            },
        });
        logger.info(`Deleted ${deletedLeads.count} old leads`);

        // 2. Delete orphaned businesses (no leads attached)
        const deletedBusinesses = await prisma.business.deleteMany({
            where: {
                leads: {
                    none: {},
                },
            },
        });
        logger.info(`Deleted ${deletedBusinesses.count} orphaned businesses`);

        // 3. Also clean up old query history (optional - keeps rotation fresh)
        const deletedQueries = await prisma.queryHistory.deleteMany({
            where: {
                createdAt: {
                    lt: cutoffDate,
                },
            },
        });
        logger.info(`Deleted ${deletedQueries.count} old query history entries`);

        logger.info('Database cleanup complete');
    } catch (error) {
        logger.error({ err: error }, 'Database cleanup failed');
    }
}
