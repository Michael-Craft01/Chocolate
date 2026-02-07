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

    async dispatch(lead: LeadPayload, tier: 'hot' | 'warm' = 'warm') {
        const truncate = (str: string, max: number) => str.length > max ? str.substring(0, max - 3) + '...' : str;

        const funQuotes = [
            "Don't let this one slip! 🍌",
            "Time to make some money! 💸",
            "Lead secured. Mission accomplished. 🕵️‍♂️",
            "Another one bites the dust... in a good way! 🎶",
            "Go get 'em, tiger! 🐯",
            "Cha-ching! 💰",
        ];
        const randomQuote = funQuotes[Math.floor(Math.random() * funQuotes.length)];
        const validWebsite = this.isValidWebsiteUrl(lead.website) ? lead.website : null;

        // Color and label based on tier
        const embedColor = tier === 'hot' ? 0x00FF00 : 0xFFA500; // 🟢 Green vs 🟠 Orange
        const tierLabel = tier === 'hot' ? '🔥 HOT LEAD' : '⚡ WARM LEAD';

        const detailsEmbed = {
            title: tierLabel,
            description: `**${lead.name}** just landed on our radar. Here's the intel:`,
            color: embedColor,
            fields: [
                { name: 'Business', value: `**${lead.name}**`, inline: true },
                { name: 'Location', value: lead.location, inline: true },
                { name: 'Industry', value: lead.industry, inline: true },
                { name: 'Pain Point', value: lead.painPoint },
                { name: 'Website', value: lead.website || '_Ghost Town_', inline: true },
                { name: 'Phone', value: lead.phone || '_No Signal_', inline: true },
                { name: 'Email', value: lead.email || '_Snail Mail?_', inline: true },
            ],
            footer: {
                text: `LogicHQ Bot says: "${randomQuote}"`,
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

        // WhatsApp button - direct to number, no pre-filled message
        if (lead.phone) {
            // Remove everything except numbers (and keep + if present)
            // Actually, for wa.me, we just want numbers.
            const cleanPhone = lead.phone.replace(/\D/g, '');

            // Check if we have enough digits (at least 7)
            if (cleanPhone.length >= 7) {
                // Use full API link as it can be more reliable than wa.me shortlinks in some clients
                const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}`;

                buttonRow.components.push({
                    type: 2, // Button
                    style: 5, // Link
                    label: 'Chat on WhatsApp', // More descriptive label
                    url: waUrl,
                });
                logger.debug(`Added WhatsApp button: ${waUrl}`);

                // Add a fallback link in the embed fields to ensure visibility
                detailsEmbed.fields.push({
                    name: '📱 WhatsApp Link',
                    value: `[Click to Chat](${waUrl})`,
                    inline: true
                });
            } else {
                logger.debug(`Skipped WhatsApp button -- Phone: ${lead.phone}, Clean: ${cleanPhone}`);
            }
        }

        // Website button - only valid URLs
        if (validWebsite) {
            buttonRow.components.push({
                type: 2, // Button
                style: 5, // Link
                label: 'Website',
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
