import prisma from '../lib/prisma.js';
import { LOCATIONS_ZW, LOCATIONS_SA, INDUSTRIES, QUERY_TEMPLATES } from '../constants.js';
import { logger } from '../lib/logger.js';
import { config } from '../config.js';
export class QueryGenerator {
    /**
     * Generate a batch of queries for a cycle - targeting both ZW and SA
     * @param countPerCountry Number of queries to generate per country
     */
    async generateBatchQueries(countPerCountry = 25) {
        const queries = [];
        // Generate queries for Zimbabwe
        const zwQueries = await this.generateQueriesForCountry(LOCATIONS_ZW, 'ZW', countPerCountry);
        queries.push(...zwQueries);
        // Generate queries for South Africa
        const saQueries = await this.generateQueriesForCountry(LOCATIONS_SA, 'SA', countPerCountry);
        queries.push(...saQueries);
        logger.info(`Generated ${queries.length} queries (${zwQueries.length} ZW, ${saQueries.length} SA)`);
        return queries;
    }
    async generateQueriesForCountry(locations, country, maxQueries) {
        const now = new Date();
        const rangeLimit = new Date(now.getTime() - config.ROTATION_PERIOD_DAYS * 24 * 60 * 60 * 1000);
        const queries = [];
        const shuffledLocations = this.shuffle([...locations]);
        const shuffledIndustries = this.shuffle([...INDUSTRIES]);
        for (const location of shuffledLocations) {
            if (queries.length >= maxQueries)
                break;
            for (const industry of shuffledIndustries) {
                if (queries.length >= maxQueries)
                    break;
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
                    // Upsert to history
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
                    queries.push({ query, location, industry, country });
                }
            }
        }
        return queries;
    }
    /**
     * Legacy method for single query generation (backward compatibility)
     */
    async generateNextQuery() {
        const batch = await this.generateBatchQueries(1);
        return batch[0] ?? null;
    }
    shuffle(array) {
        return array.sort(() => Math.random() - 0.5);
    }
    getRandomItem(array) {
        const item = array[Math.floor(Math.random() * array.length)];
        if (!item)
            throw new Error('Random item selection failed: array might be empty');
        return item;
    }
}
export const queryGenerator = new QueryGenerator();
//# sourceMappingURL=queryGenerator.js.map