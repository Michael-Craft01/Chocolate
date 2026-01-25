import axios from 'axios';
import { config } from '../config.js';
import { logger } from '../lib/logger.js';

export interface LeadPayload {
    name: string;
    industry: string;
    painPoint: string;
    recommendedSolution?: string;
    message: string;
    website?: string | null;
    phone?: string | null;
    email?: string | null;
}

export class DiscordDispatcher {
    private isValidWebsiteUrl(url: string | null | undefined): boolean {
        if (!url) return false;
        // Reject Google tracking URLs and very long URLs
        if (url.includes('google.com/aclk')) return false;
        if (url.includes('googleadservices.com')) return false;
        if (url.length > 500) return false;
        return url.startsWith('http://') || url.startsWith('https://');
    }

    async dispatch(lead: LeadPayload) {
        const truncate = (str: string, max: number) => str.length > max ? str.substring(0, max - 3) + '...' : str;

        const validWebsite = this.isValidWebsiteUrl(lead.website) ? lead.website : null;

        const embed = {
            title: '🚀 Michael, New Lead Found!',
            color: 0x5865f2,
            fields: [
                { name: 'Business', value: lead.name, inline: true },
                { name: 'Industry', value: lead.industry, inline: true },
                { name: 'Pain Point', value: truncate(lead.painPoint, 500) },
                { name: 'Recommended Solution', value: truncate(lead.recommendedSolution || 'Digital marketing strategy', 500) },
                { name: 'Website', value: validWebsite || 'N/A', inline: true },
                { name: 'Phone', value: lead.phone || 'N/A', inline: true },
                { name: 'Email', value: lead.email || 'N/A', inline: true },
                { name: 'Suggested Message', value: truncate(lead.message, 1000) },
            ],
            timestamp: new Date().toISOString(),
        };

        const components: any[] = [];
        const buttonRow = {
            type: 1,
            components: [] as any[],
        };

        // WhatsApp button - direct to number, no pre-filled message
        if (lead.phone) {
            // Remove everything except numbers
            const cleanPhone = lead.phone.replace(/\D/g, '');

            // Check if we have enough digits (at least 7)
            if (cleanPhone.length >= 7) {
                // Use wa.me short link format - often cleaner for Discord
                // Ensure no leading '+' is double-added if cleanPhone has it (replace removes it)
                const waUrl = `https://wa.me/${cleanPhone}`;

                buttonRow.components.push({
                    type: 2, // Button
                    style: 5, // Link
                    label: 'WhatsApp', // Removed emoji just in case
                    url: waUrl,
                });
                logger.debug(`Added WhatsApp button: ${waUrl}`);
            } else {
                logger.debug(`Skipped WhatsApp button -- Phone: ${lead.phone}, Clean: ${cleanPhone}`);
            }
        }

        // Website button - only valid URLs
        if (validWebsite) {
            buttonRow.components.push({
                type: 2, // Button
                style: 5, // Link
                label: 'Website', // Removed emoji just in case
                url: validWebsite,
            });
        }

        if (buttonRow.components.length > 0) {
            components.push(buttonRow);
            logger.debug(`Components check: ${JSON.stringify(buttonRow.components)}`);
        } else {
            logger.debug('No buttons generated for this lead');
        }

        try {
            logger.info(`Dispatching lead to Discord: ${lead.name}`);
            await axios.post(config.DISCORD_WEBHOOK, {
                embeds: [embed],
                components: components,
            });
            return true;
        } catch (error) {
            logger.error({ err: error }, 'Discord Dispatch error:');
            return false;
        }
    }
}

export const discordDispatcher = new DiscordDispatcher();
