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
    location: string;
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

    async dispatch(lead: LeadPayload, tier: 'hot' | 'warm' = 'warm', webhookUrl?: string | null) {
        const targetWebhook = webhookUrl || config.DISCORD_WEBHOOK;
        
        if (!targetWebhook) {
            logger.warn('No Discord webhook configured for dispatch');
            return false;
        }

        const truncate = (str: string, max: number) => str.length > max ? str.substring(0, max - 3) + '...' : str;

        const funQuotes = [
            "Neural link established. Target identified. 🧠",
            "High-value intelligence secured. 🎯",
            "Extraction complete. Mission accomplished. 🕵️‍♂️",
            "Market data synchronized. Opportunity detected. ⚡",
            "Protocol engaged. Go get 'em, tiger! 🐯",
            "Asset acquired. Awaiting deployment. 💰",
        ];
        const randomQuote = funQuotes[Math.floor(Math.random() * funQuotes.length)];
        const validWebsite = this.isValidWebsiteUrl(lead.website) ? lead.website : null;

        // Color and label based on tier
        const embedColor = tier === 'hot' ? 0x3b82f6 : 0x8b5cf6; // 🔵 Blue vs 🟣 Violet
        const tierLabel = tier === 'hot' ? '🔵 HYPER-DRIVE LEAD' : '🟣 INTEL CAPTURE';

        const detailsEmbed = {
            title: tierLabel,
            description: `**${lead.name}** has been prioritized for extraction. Telemetry follows:`,
            color: embedColor,
            fields: [
                { name: 'Entity', value: `**${lead.name}**`, inline: true },
                { name: 'Grid Location', value: lead.location, inline: true },
                { name: 'Sector', value: lead.industry, inline: true },
                { name: 'Pain Vector', value: lead.painPoint },
                { name: 'Source Node', value: lead.website || '_Ghost Town_', inline: true },
                { name: 'Frequency', value: lead.phone || '_No Signal_', inline: true },
                { name: 'Registry', value: lead.email || '_Snail Mail?_', inline: true },
            ],
            footer: {
                text: `HyprLead Intelligence says: "${randomQuote}"`,
            },
            timestamp: new Date().toISOString(),
        };

        const messageEmbed = {
            description: `**Suggested Attack Plan**\n\`\`\`${lead.message}\`\`\``,
            color: embedColor, // Match color to tier
        };

        const components: any[] = [];
        const buttonRow = {
            type: 1,
            components: [] as any[],
        };

        // WhatsApp button
        if (lead.phone) {
            const cleanPhone = lead.phone.replace(/\D/g, '');
            if (cleanPhone.length >= 7) {
                const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}`;

                buttonRow.components.push({
                    type: 2,
                    style: 5,
                    label: 'Chat on WhatsApp',
                    url: waUrl,
                });
            }
        }

        // Website button
        if (validWebsite) {
            buttonRow.components.push({
                type: 2,
                style: 5,
                label: 'Website',
                url: validWebsite,
            });
        }

        if (buttonRow.components.length > 0) {
            components.push(buttonRow);
        }

        try {
            logger.info(`Dispatching lead to Discord: ${lead.name} (Webhook: ${targetWebhook.substring(0, 30)}...)`);
            await axios.post(targetWebhook, {
                embeds: [detailsEmbed, messageEmbed],
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
