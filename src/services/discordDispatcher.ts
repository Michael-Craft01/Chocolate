import axios from 'axios';
import { config } from '../config.js';
import { logger } from '../lib/logger.js';
import { cleanOutreachMessage } from './aiService.js';

export interface LeadPayload {
    name: string;
    industry: string;
    painPoint: string;
    recommendedSolution?: string;
    message: string;
    website?: string | null;
    phone?: string | null;
    email?: string | null;
    contactStatus?: string | null;
    bestContactChannel?: string | null;
    contactPages?: string[];
    socialProfiles?: string[];
    location: string;
    companyName?: string | null;
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
                { name: 'Contact Route', value: lead.bestContactChannel || lead.contactStatus || '_No Route_', inline: true },
            ],
            footer: {
                text: `HyprLead Intelligence says: "${randomQuote}"`,
            },
            timestamp: new Date().toISOString(),
        };

        const outreachMessage = cleanOutreachMessage(lead.message || '');
        const messageEmbed = {
            description: `**Suggested Attack Plan**\n\`\`\`${outreachMessage}\`\`\``,
            color: embedColor, // Match color to tier
        };
        const components: any[] = [];
        const buttonRow = {
            type: 1,
            components: [] as any[],
        };

        // WhatsApp button with pre-filled message (Safe 512 length constraint)
        if (lead.phone) {
            const cleanPhone = lead.phone.replace(/\D/g, '');
            if (cleanPhone.length >= 7) {
                const baseUrl = `https://wa.me/${cleanPhone}?text=`;
                const maxTextLen = 512 - baseUrl.length - 15; // leave safety margin
                let textToSend = '';
                if (maxTextLen > 0) {
                    textToSend = outreachMessage;
                    if (encodeURIComponent(textToSend).length > maxTextLen) {
                        while (textToSend.length > 0 && encodeURIComponent(textToSend + '...').length > maxTextLen) {
                            textToSend = textToSend.substring(0, textToSend.length - 1);
                        }
                        textToSend = textToSend + '...';
                    }
                }
                const waUrl = baseUrl + encodeURIComponent(textToSend);

                buttonRow.components.push({
                    type: 2,
                    style: 5,
                    label: 'WhatsApp',
                    url: waUrl,
                });
            }
        }

        // Email button with pre-filled message (Safe 512 length constraint)
        if (lead.email) {
            const senderCompany = lead.companyName || 'HyprLead';
            const subject = `Outreach from ${senderCompany}`;
            const baseUrl = `mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=`;
            const maxBodyLen = 512 - baseUrl.length - 15; // safety margin
            let bodyToSend = '';
            if (maxBodyLen > 0) {
                bodyToSend = outreachMessage;
                if (encodeURIComponent(bodyToSend).length > maxBodyLen) {
                    while (bodyToSend.length > 0 && encodeURIComponent(bodyToSend + '...').length > maxBodyLen) {
                        bodyToSend = bodyToSend.substring(0, bodyToSend.length - 1);
                    }
                    bodyToSend = bodyToSend + '...';
                }
            }
            const mailtoUrl = baseUrl + encodeURIComponent(bodyToSend);

            buttonRow.components.push({
                type: 2,
                style: 5,
                label: 'Email',
                url: mailtoUrl,
            });
        }

        // Direct Call button
        if (lead.phone) {
            const cleanPhone = lead.phone.replace(/[^\d+]/g, '');
            buttonRow.components.push({
                type: 2,
                style: 5,
                label: 'Call Lead',
                url: `tel:${cleanPhone}`,
            });
        }

        // Website button (if room in row)
        if (validWebsite && buttonRow.components.length < 5) {
            buttonRow.components.push({
                type: 2,
                style: 5,
                label: 'Website',
                url: validWebsite,
            });
        }

        // Contact Route button (if room in row)
        const contactUrl = lead.contactPages?.[0] || lead.socialProfiles?.[0];
        if (contactUrl && buttonRow.components.length < 5) {
            buttonRow.components.push({
                type: 2,
                style: 5,
                label: 'Contact Route',
                url: contactUrl,
            });
        }

        if (buttonRow.components.length > 0) {
            // Discord limits action row to max 5 components
            buttonRow.components = buttonRow.components.slice(0, 5);
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
