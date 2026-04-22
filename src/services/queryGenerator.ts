import prisma from '../lib/prisma.js';
import { LOCATIONS_ZW, INDUSTRIES, QUERY_TEMPLATES } from '../constants.js';
import { logger } from '../lib/logger.js';
import { config } from '../config.js';

export interface QueryData {
    query: string;
    location: string;
    industry: string;
    country: string;
}

export class QueryGenerator {
    /**
     * Generate a batch of queries for a specific campaign cycle
     */
    async generateBatchQueries(count: number = 25, campaign?: any): Promise<QueryData[]> {
        logger.info({ 
            campaignId: campaign?.id, 
            providedLocations: campaign?.locations?.length, 
            providedIndustries: campaign?.industries?.length 
        }, '🔍 Generating batch queries');

        const locations = campaign?.locations && campaign.locations.length > 0 
            ? campaign.locations 
            : (LOCATIONS_ZW.length > 0 ? LOCATIONS_ZW : ['Global']);
            
        const industries = campaign?.industries && campaign.industries.length > 0
            ? campaign.industries
            : (INDUSTRIES.length > 0 ? INDUSTRIES : ['Business']);

        logger.info({ 
            finalLocations: locations.length, 
            finalIndustries: industries.length 
        }, '📊 Final query parameters decided');

        const country = campaign?.targetCountry || 'US';
        
        const queries = await this.generateQueriesForContext(
            locations, 
            industries,
            country, 
            count,
            campaign?.id
        );

        logger.info(`Generated ${queries.length} queries for Campaign: ${campaign?.name || 'Global'}`);
        return queries;
    }

    private async generateQueriesForContext(
        locations: string[],
        industries: string[],
        country: string,
        maxQueries: number,
        campaignId?: string
    ): Promise<QueryData[]> {
        const now = new Date();
        const rangeLimit = new Date(now.getTime() - config.ROTATION_PERIOD_DAYS * 24 * 60 * 60 * 1000);
        const queries: QueryData[] = [];

        const shuffledLocations = this.shuffle([...locations]);
        const shuffledIndustries = this.shuffle([...industries]);

        for (const location of shuffledLocations) {
            if (queries.length >= maxQueries) break;

            for (const industry of shuffledIndustries) {
                if (queries.length >= maxQueries) break;

                const recentHistory = await prisma.queryHistory.findUnique({
                    where: {
                        location_industry_campaignId: {
                            location,
                            industry,
                            campaignId: campaignId || null as any
                        },
                    },
                });

                // If no history exists, or it's old, OR if we need at least some queries to start
                if (!recentHistory || recentHistory.createdAt < rangeLimit || queries.length < 5) {
                    const template = this.getRandomItem(QUERY_TEMPLATES);
                    const query = template.replace('{industry}', industry).replace('{location}', location);

                    // Upsert to history
                    await prisma.queryHistory.upsert({
                        where: {
                            location_industry_campaignId: {
                                location,
                                industry,
                                campaignId: campaignId || null as any
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
                            campaignId: campaignId || null
                        },
                    });

                    queries.push({ query, location, industry, country });
                }
            }
        }

        return queries;
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
