import axios from 'axios';
import { config } from '../config.js';
import { logger } from '../lib/logger.js';

export interface LeadPayload {
    name: string;
    industry: string;
    painPoint: string;
    message: string;
    website?: string | null;
    phone?: string | null;
    email?: string | null;
}

export class DiscordDispatcher {
    async dispatch(lead: LeadPayload) {
        const embed = {
            title: '🚀 New Lead Found!',
            color: 0x5865f2,
            fields: [
                { name: 'Business', value: lead.name, inline: true },
                { name: 'Industry', value: lead.industry, inline: true },
                { name: 'Pain Point', value: lead.painPoint },
                { name: 'Website', value: lead.website || 'N/A', inline: true },
                { name: 'Phone', value: lead.phone || 'N/A', inline: true },
                { name: 'Email', value: lead.email || 'N/A', inline: true },
                { name: 'Suggested Message', value: `\`\`\`${lead.message}\`\`\`` },
            ],
            timestamp: new Date().toISOString(),
        };

        try {
            logger.info(`Dispatching lead to Discord: ${lead.name}`);
            await axios.post(config.DISCORD_WEBHOOK, {
                embeds: [embed],
            });
        } catch (error) {
            logger.error({ err: error }, 'Discord Dispatch error:');
        }
    }
}

export const discordDispatcher = new DiscordDispatcher();
