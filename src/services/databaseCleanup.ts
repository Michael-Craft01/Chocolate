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

export async function cleanupStaleCycles(onStartup = false): Promise<void> {
    logger.info(`🧹 Starting systematic stale cycle runs cleanup check (onStartup: ${onStartup})...`);
    try {
        const now = Date.now();
        
        // Find all active cycle runs (QUEUED or RUNNING)
        const cycleRuns = await prisma.cycleRun.findMany({
            where: {
                status: { in: ['QUEUED', 'RUNNING'] }
            }
        });

        if (cycleRuns.length === 0) {
            logger.info('✅ No active cycle runs found.');
            return;
        }

        let cleaned = 0;
        for (const cycle of cycleRuns) {
            let isStale = false;
            
            if (onStartup) {
                // Server reboot means any previously active cycles are orphaned and cannot resume
                isStale = true;
            } else {
                if (cycle.status === 'QUEUED') {
                    // Stale if queued for more than 24 hours
                    isStale = cycle.createdAt.getTime() < now - 24 * 60 * 60 * 1000;
                } else if (cycle.status === 'RUNNING') {
                    // Stale if running longer than 24 hours (allowing cycles to take hours for cooldowns/stealth)
                    const startTime = cycle.startedAt ? cycle.startedAt.getTime() : cycle.createdAt.getTime();
                    isStale = startTime < now - 24 * 60 * 60 * 1000;
                }
            }

            if (isStale) {
                logger.info(`- Cycle ${cycle.id} (${cycle.status}) was determined stale. Marking as FAILED.`);
                await prisma.cycleRun.update({
                    where: { id: cycle.id },
                    data: {
                        status: 'FAILED',
                        failureReason: onStartup ? 'Server restarted / crashed' : 'Execution timed out (24h limit)',
                        completedAt: new Date()
                    }
                });

                // Refund 1 cycle to the user if they had 0 leads found
                if (cycle.leadsFound === 0) {
                    logger.info(`  🔄 Refunding 1 cycle to User ${cycle.userId}...`);
                    await prisma.user.update({
                        where: { id: cycle.userId },
                        data: {
                            cyclesRemaining: { increment: 1 }
                        }
                    });
                }
                cleaned++;
            }
        }
        
        logger.info(`🎉 Stale cycle check complete. Cleaned up ${cleaned} run(s).`);
    } catch (error: any) {
        logger.error({ err: error.message }, 'Failed to cleanup stale cycle runs');
    }
}
