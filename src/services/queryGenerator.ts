import prisma from '../lib/prisma.js';
import { LOCATIONS, INDUSTRIES, QUERY_TEMPLATES } from '../constants.js';
import { logger } from '../lib/logger.js';
import { config } from '../config.js';

export class QueryGenerator {
    async generateNextQuery() {
        const now = new Date();
        const rangeLimit = new Date(now.getTime() - config.ROTATION_PERIOD_DAYS * 24 * 60 * 60 * 1000);

        for (const location of this.shuffle(LOCATIONS)) {
            for (const industry of this.shuffle(INDUSTRIES)) {
                // Check if this combo was searched recently
                const recentHistory = await prisma.queryHistory.findUnique({
                    where: {
                        location_industry: {
                            location,
                            industry,
                        },
                    },
                });

                if (!recentHistory || recentHistory.createdAt < rangeLimit) {
                    const template = this.getRandomItem(QUERY_TEMPLATES);
                    const query = template.replace('{industry}', industry).replace('{location}', location);

                    logger.info(`Generated new query: "${query}" for ${location}/${industry}`);

                    // Upsert to history to mark as "searched"
                    await prisma.queryHistory.upsert({
                        where: {
                            location_industry: {
                                location,
                                industry,
                            },
                        },
                        update: {
                            query,
                            createdAt: new Date(),
                        },
                        create: {
                            location,
                            industry,
                            query,
                        },
                    });

                    return { query, location, industry };
                }
            }
        }

        logger.warn('No new location/industry combinations found for the current rotation period.');
        return null;
    }

    private shuffle<T>(array: T[]): T[] {
        return array.sort(() => Math.random() - 0.5);
    }

    private getRandomItem<T>(array: T[]): T {
        const item = array[Math.floor(Math.random() * array.length)];
        if (!item) throw new Error('Random item selection failed: array might be empty');
        return item;
    }
}

export const queryGenerator = new QueryGenerator();
