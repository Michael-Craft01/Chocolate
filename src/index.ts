import cron from 'node-cron';
import { queryGenerator, QueryData } from './services/queryGenerator.js';
import { scraper } from './services/scraper.js';
import { aiService } from './services/aiService.js';
import { messageGenerator } from './services/messageGenerator.js';
import { discordDispatcher } from './services/discordDispatcher.js';
import prisma from './lib/prisma.js';
import { logger } from './lib/logger.js';
import { config } from './config.js';
import { cleanupDatabase } from './services/databaseCleanup.js';
import { startServer } from './web/server.js';

const LEADS_PER_COUNTRY = 25;

async function processLeadsForQuery(queryData: QueryData, targetCount: number): Promise<number> {
    let leadsFound = 0;

    try {
        logger.info(`Scraping for: "${queryData.query}" (${queryData.country})`);

        const businesses = await scraper.scrape(queryData.query, queryData.country);

        for (const business of businesses) {
            if (leadsFound >= targetCount) break;

            // Validate phone number (must be at least 7 digits)
            let validPhone = business.phone;
            if (validPhone) {
                // Formatting: Remove non-digits
                let digits = validPhone.replace(/\D/g, '');

                // Add country code if missing (assuming starts with 0 means local)
                if (validPhone.trim().startsWith('0')) {
                    if (queryData.country === 'ZW') {
                        digits = '263' + digits.substring(1); // Replace leading 0 with 263
                    } else if (queryData.country === 'SA') {
                        digits = '27' + digits.substring(1); // Replace leading 0 with 27
                    }
                    validPhone = '+' + digits;
                }

                if (digits.length < 9) { // Increased min length due to country code
                    validPhone = null;
                }
            }

            // Skip leads without valid phone AND email - we need contact info
            if (!validPhone && !business.email) {
                logger.debug(`Skipping ${business.name} - no valid phone or email`);
                continue;
            }

            // Smarter Business Lookup: Check by Name AND (Phone OR Website) to match specific branches
            // If we only have name, we fall back to name check.
            let dbBusiness = await prisma.business.findFirst({
                where: {
                    name: business.name,
                    OR: [
                        { phone: validPhone || undefined },
                        { website: business.website || undefined }
                    ]
                },
            });

            // Fallback: If no match with extra details, try just name (legacy behavior, but safer for partial data)
            if (!dbBusiness) {
                dbBusiness = await prisma.business.findFirst({
                    where: { name: business.name }
                });
            }

            if (!dbBusiness) {
                dbBusiness = await prisma.business.create({
                    data: {
                        name: business.name,
                        website: business.website,
                        phone: validPhone, // Use validated phone
                    },
                });
            }

            // Check if we already processed this business as a lead RECENTLY
            const existingLead = await prisma.lead.findFirst({
                where: { businessId: dbBusiness.id },
                orderBy: { createdAt: 'desc' } // Get most recent one
            });

            if (existingLead) {
                // COOLDOWN LOGIC:
                // If lead exists, check if we should re-engage.
                // Rule: If dispatched > 30 days ago, OR never dispatched (failed?), we treat as new.

                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                const recentlyDispatched = existingLead.dispatchedAt && existingLead.dispatchedAt > thirtyDaysAgo;

                if (recentlyDispatched) {
                    logger.debug(`Skipping recent lead: ${business.name} (Dispatched: ${existingLead.dispatchedAt?.toISOString()})`);
                    continue;
                }

                logger.info(`Re-engaging lead: ${business.name} (Last dispatched: ${existingLead.dispatchedAt?.toISOString() ?? 'Never'})`);
                // Proceed to create a NEW lead entry for this cycle to track the re-engagement
            }

            // AI Enrichment
            const enrichment = await aiService.enrichLead(business.name, business.category ?? undefined);

            // Generate Message
            const message = messageGenerator.generate(
                business.name,
                enrichment.industry,
                enrichment.painPoint,
                enrichment.recommendedSolution
            );

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
            const dispatched = await discordDispatcher.dispatch({
                name: business.name,
                industry: enrichment.industry,
                painPoint: enrichment.painPoint,
                recommendedSolution: enrichment.recommendedSolution,
                message: message,
                website: business.website,
                phone: validPhone,
                location: `${queryData.location}, ${queryData.country}`,
            });

            // Only mark as dispatched if Discord succeeded
            if (dispatched) {
                await prisma.lead.update({
                    where: { id: lead.id },
                    data: { dispatchedAt: new Date() },
                });
            }

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

    // Clean up old records first (14 days)
    await cleanupDatabase();

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
if (process.env.RUN_ONCE === 'true') {
    logger.info('RUN_ONCE enabled: Executing immediate cycle and exiting...');
    runEngine().then(() => {
        logger.info('One-time execution complete. Exiting.');
        process.exit(0);
    }).catch(err => {
        logger.error({ err }, 'One-time execution failed.');
        process.exit(1);
    });
} else {
    cron.schedule(config.CRON_SCHEDULE, () => {
        runEngine();
    });

    // Run immediately on start
    runEngine();
    startServer();

    logger.info(`Lead Engine started. Schedule: ${config.CRON_SCHEDULE}`);
}
