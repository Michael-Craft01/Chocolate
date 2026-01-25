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
        const funQuotes = [
            "Don't let this one slip! 🍌",
            "Time to make some money! 💸",
            "Lead secured. Mission accomplished. 🕵️‍♂️",
            "Another one bites the dust... in a good way! 🎶",
            "Go get 'em, tiger! 🐯",
            "Cha-ching! 💰",
        ];
        const randomQuote = funQuotes[Math.floor(Math.random() * funQuotes.length)];

        const embed = {
            title: '🔥 HOT LEAD INCOMING! DO NOT DROP! 🚀',
            description: `**${lead.name}** just landed on our radar. Here's the intel:`,
            color: 0xFF4500, // OrangeRed
            fields: [
                { name: '🏢 Business', value: `**${lead.name}**`, inline: true },
                { name: '🏭 Industry', value: lead.industry, inline: true },
                { name: '🤕 Pain Point', value: lead.painPoint },
                { name: '🌐 Website', value: lead.website || '_Ghost Town_', inline: true },
                { name: '📱 Phone', value: lead.phone || '_No Signal_', inline: true },
                { name: '📧 Email', value: lead.email || '_Snail Mail?_', inline: true },
                { name: '💡 Suggested Attack Plan', value: `\`\`\`${lead.message}\`\`\`` },
            ],
            footer: {
                text: `LogicHQ Bot says: "${randomQuote}"`,
            },
            timestamp: new Date().toISOString(),
        };

        // Build Action Links (Markdown) because Webhooks don't support Button Components
        const actions: string[] = [];

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
            });
        } catch (error) {
            logger.error({ err: error }, 'Discord Dispatch error:');
        }
    }
}

export const discordDispatcher = new DiscordDispatcher();
