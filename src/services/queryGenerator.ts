import prisma from '../lib/prisma.js';
import { LOCATIONS_ZW, INDUSTRIES, QUERY_TEMPLATES } from '../constants.js';
import { logger } from '../lib/logger.js';
import { config } from '../config.js';

export interface QueryData {
    query: string;
    location: string;
    industry: string;
    country: string;
    page: number;
}

export class QueryGenerator {
    /**
     * Generate a batch of queries for a specific campaign cycle
     */
    private async expandLocations(baseLocations: string[], country: string): Promise<string[]> {
        const expanded = new Set<string>(baseLocations);
        try {
            const prompt = `<start_of_turn>user
SYSTEM: You are a geographical intelligence agent.
TASK: For the following locations in ${country}, suggest 10 neighboring suburbs, industrial zones, or satellite towns.
LOCATIONS: ${baseLocations.join(', ')}

FORMAT: Respond with a comma-separated list only.
<end_of_turn>
<start_of_turn>model`;
            const result = await aiService['model'].generateContent(prompt);
            const text = (await result.response).text();
            const locs = text.split(',').map(l => l.trim()).filter(l => l.length > 0);
            locs.forEach(l => expanded.add(l));
        } catch (err) {
            logger.error({ err }, 'Location expansion failed');
        }
        return Array.from(expanded);
    }

    private async expandIndustries(baseIndustries: string[]): Promise<string[]> {
        const expanded = new Set<string>(baseIndustries);
        
        try {
            const prompt = `<start_of_turn>user
SYSTEM: You are a market intelligence strategist.
TASK: Expand these base industries into 10 highly specific, high-intent sub-niches each.
BASE INDUSTRIES: ${baseIndustries.join(', ')}

FORMAT: Respond with a comma-separated list of niches only. No other text.
<end_of_turn>
<start_of_turn>model`;
            
            const result = await aiService['model'].generateContent(prompt);
            const text = (await result.response).text();
            const niches = text.split(',').map(n => n.trim()).filter(n => n.length > 0);
            niches.forEach(n => expanded.add(n));
        } catch (err) {
            logger.error({ err }, 'Niche expansion failed, using base industries');
        }
        
        return Array.from(expanded);
    }

    async generateBatchQueries(count: number = 25, campaign?: any): Promise<QueryData[]> {
        logger.info({ 
            campaignId: campaign?.id, 
            providedLocations: campaign?.locations?.length, 
            providedIndustries: campaign?.industries?.length 
        }, '🔍 Generating batch queries');

        const baseLocations = campaign?.locations && campaign.locations.length > 0 ? campaign.locations : (LOCATIONS_ZW.length > 0 ? LOCATIONS_ZW : ['Global']);
        const baseIndustries = campaign?.industries && campaign.industries.length > 0 ? campaign.industries : (INDUSTRIES.length > 0 ? INDUSTRIES : ['Business']);
        const country = campaign?.targetCountry || 'US';

        const [industries, locations] = await Promise.all([
            this.expandIndustries(baseIndustries),
            this.expandLocations(baseLocations, country)
        ]);

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

                if (!recentHistory || recentHistory.createdAt < rangeLimit || queries.length < 5) {
                    const template = this.getRandomItem(QUERY_TEMPLATES);
                    const powerWords = ['', 'Premium ', 'Established ', 'Leading ', 'High-end ', 'Industrial '];
                    const powerWord = Math.random() > 0.7 ? this.getRandomItem(powerWords) : '';
                    
                    let query = template
                        .replace('{industry}', `${powerWord}${industry}`)
                        .replace('{location}', location);

                    if (Math.random() > 0.8) query += ' 2025';

                    // Determine current page (cycle depth)
                    const currentPage = (recentHistory?.page || 0) + 1;
                    const cappedPage = currentPage > 10 ? 1 : currentPage; // Reset after 10 pages of depth

                    // Upsert to history with page increment
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
                            page: cappedPage,
                            createdAt: new Date() 
                        },
                        create: {
                            location,
                            industry,
                            query,
                            page: cappedPage,
                            campaignId: campaignId || null
                        },
                    });

                    queries.push({ query, location, industry, country, page: cappedPage });
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
