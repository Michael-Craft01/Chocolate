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
            const cleanPhone = lead.phone.replace(/[^0-9+]/g, '');
            actions.push(`[**📞 Call**](tel:${cleanPhone})`);

            // Format for WhatsApp: remove '+' and ensure it doesn't start with '0' if possible
            // Note: If it starts with '0', wa.me usually fails without country code.
            // We strip non-digits (and +) for the API.
            let waPhone = cleanPhone.replace(/[^0-9]/g, '');

            // Heuristic: If it starts with '0' (e.g. 077...), it likely needs a country code.
            // Since we can't be 100% sure between Zim (+263) and SA (+27) without extra context,
            // we will try to infer or just output it.
            // However, the user wants a working link.
            // If the scraped number came with a country code (e.g. +263...), we are good.
            // If it came as 07..., we are stuck.
            // BUT, we can include the pre-filled message which is very helpful.
            // Truncate message to avoid Discord URL limits (2048 chars for URL, but field value limit is 1024)
            const shortMessage = lead.message.length > 500 ? lead.message.substring(0, 500) + '...' : lead.message;
            const encodedMessage = encodeURIComponent(shortMessage);
            actions.push(`[**💬 WhatsApp**](https://api.whatsapp.com/send?phone=${waPhone}&text=${encodedMessage})`);
        }

        if (lead.email) {
            const subject = encodeURIComponent(`Growth Opportunity for ${lead.name}`);
            const shortBody = lead.message.length > 500 ? lead.message.substring(0, 500) + '...' : lead.message;
            const body = encodeURIComponent(shortBody);
            actions.push(`[**✉️ Email**](mailto:${lead.email}?subject=${subject}&body=${body})`);
        }

        if (actions.length > 0) {
            // Make it prominent by putting it at the top of fields or description
            // We'll put it as the first field
            embed.fields.unshift({
                name: '⚡ **QUICK ACTIONS**',
                value: actions.join('\n\n'), // Use newlines for better visibility/button-like feel
                inline: false
            });
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
