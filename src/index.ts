import cron from 'node-cron';
import { queryGenerator, QueryData } from './services/queryGenerator.js';
import { scraper } from './services/scraper.js';
import { aiService } from './services/aiService.js';
import { messageGenerator } from './services/messageGenerator.js';
import { discordDispatcher } from './services/discordDispatcher.js';
import prisma from './lib/prisma.js';
import { logger } from './lib/logger.js';
import { config } from './config.js';

const LEADS_PER_COUNTRY = 25;

async function processLeadsForQuery(queryData: QueryData, targetCount: number): Promise<number> {
    let leadsFound = 0;

    try {
        logger.info(`Scraping for: "${queryData.query}" (${queryData.country})`);
        const businesses = await scraper.scrape(queryData.query);

        for (const business of businesses) {
            if (leadsFound >= targetCount) break;

            // Check if business already exists
            let dbBusiness = await prisma.business.findFirst({
                where: { name: business.name },
            });

            if (!dbBusiness) {
                dbBusiness = await prisma.business.create({
                    data: {
                        name: business.name,
                        website: business.website,
                        phone: business.phone,
                    },
                });
            }

            // Check if we already processed this business as a lead
            const existingLead = await prisma.lead.findFirst({
                where: { businessId: dbBusiness.id },
            });

            if (existingLead) {
                logger.debug(`Skipping already processed lead: ${business.name}`);
                continue;
            }

            // AI Enrichment
            const enrichment = await aiService.enrichLead(business.name, business.category ?? undefined);

            // Generate Message
            const message = messageGenerator.generate(business.name, enrichment.industry, enrichment.painPoint);

            // Save Lead
            const lead = await prisma.lead.create({
                data: {
                    businessId: dbBusiness.id,
                    industry: enrichment.industry,
                    painPoint: enrichment.painPoint,
                    suggestedMessage: message,
                },
            });

            // Dispatch to Discord
            await discordDispatcher.dispatch({
                name: business.name,
                industry: enrichment.industry,
                painPoint: enrichment.painPoint,
                message: message,
                website: business.website,
                phone: business.phone,
            });

            // Update lead as dispatched
            await prisma.lead.update({
                where: { id: lead.id },
                data: { dispatchedAt: new Date() },
            });

            leadsFound++;
            logger.info(`Lead ${leadsFound}/${targetCount} processed: ${business.name} (${queryData.country})`);
        }
    } catch (error) {
        logger.error({ err: error }, `Error processing query: ${queryData.query}`);
    }

    return leadsFound;
}

async function runEngine() {
    logger.info('--- Starting Lead Engine Cycle ---');
    logger.info(`Target: ${LEADS_PER_COUNTRY} leads from ZW + ${LEADS_PER_COUNTRY} leads from SA`);

    let zwLeads = 0;
    let saLeads = 0;

    try {
        // Generate batch queries for both countries
        const queries = await queryGenerator.generateBatchQueries(LEADS_PER_COUNTRY);

        // Separate queries by country
        const zwQueries = queries.filter(q => q.country === 'ZW');
        const saQueries = queries.filter(q => q.country === 'SA');

        // Process ZW queries until we hit target
        for (const queryData of zwQueries) {
            if (zwLeads >= LEADS_PER_COUNTRY) break;
            const found = await processLeadsForQuery(queryData, LEADS_PER_COUNTRY - zwLeads);
            zwLeads += found;
        }

        // Process SA queries until we hit target
        for (const queryData of saQueries) {
            if (saLeads >= LEADS_PER_COUNTRY) break;
            const found = await processLeadsForQuery(queryData, LEADS_PER_COUNTRY - saLeads);
            saLeads += found;
        }

        logger.info(`--- Lead Engine Cycle Complete ---`);
        logger.info(`Total leads: ${zwLeads + saLeads} (ZW: ${zwLeads}, SA: ${saLeads})`);
    } catch (error) {
        logger.error({ err: error }, 'Error in Lead Engine cycle:');
    } finally {
        await scraper.close();
    }
}

// Schedule the job
cron.schedule(config.CRON_SCHEDULE, () => {
    runEngine();
});

// Run immediately on start
runEngine();

logger.info(`Lead Engine started. Schedule: ${config.CRON_SCHEDULE}`);
