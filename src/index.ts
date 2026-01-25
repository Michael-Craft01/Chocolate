import cron from 'node-cron';
import { queryGenerator } from './services/queryGenerator.js';
import { scraper } from './services/scraper.js';
import { aiService } from './services/aiService.js';
import { messageGenerator } from './services/messageGenerator.js';
import { discordDispatcher } from './services/discordDispatcher.js';
import prisma from './lib/prisma.js';
import { logger } from './lib/logger.js';
import { config } from './config.js';

async function runEngine() {
    logger.info('--- Starting Lead Engine Cycle ---');

    try {
        const queryData = await queryGenerator.generateNextQuery();
        if (!queryData) return;

        const businesses = await scraper.scrape(queryData.query);

        for (const business of businesses) {
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
        }

        logger.info('--- Lead Engine Cycle Complete ---');
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
