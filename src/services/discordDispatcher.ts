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
            title: '🚀 Michael, New Lead Found! Keep Your Headup!',
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

        const components: any[] = [];
        const buttonRow = {
            type: 1, // ActionRow
            components: [] as any[],
        };

        // Phone Button
        if (lead.phone) {
            const cleanPhone = lead.phone.replace(/[^0-9+]/g, '');

            // Only add buttons if phone number looks valid (at least 7 digits)
            if (cleanPhone.replace(/\D/g, '').length >= 7) {
                buttonRow.components.push({
                    type: 2, // Button
                    style: 5, // Link
                    label: '📞 Call',
                    url: `tel:${cleanPhone}`,
                });

                // WhatsApp Business Button - Use api.whatsapp.com for Business app
                const waPhone = cleanPhone.replace('+', '');
                const waMessage = encodeURIComponent(lead.message);
                buttonRow.components.push({
                    type: 2, // Button
                    style: 5, // Link
                    label: '💬 WhatsApp',
                    url: `https://api.whatsapp.com/send?phone=${waPhone}&text=${waMessage}`,
                });
            }
        }

        // Email Button
        if (lead.email) {
            const subject = encodeURIComponent(`Growth Opportunity for ${lead.name}`);
            const body = encodeURIComponent(lead.message);
            buttonRow.components.push({
                type: 2, // Button
                style: 5, // Link
                label: '✉️ Email',
                url: `mailto:${lead.email}?subject=${subject}&body=${body}`,
            });
        }

        if (buttonRow.components.length > 0) {
            components.push(buttonRow);
        }

        try {
            logger.info(`Dispatching lead to Discord: ${lead.name}`);
            await axios.post(config.DISCORD_WEBHOOK, {
                embeds: [embed],
                components: components,
            });
        } catch (error) {
            logger.error({ err: error }, 'Discord Dispatch error:');
        }
    }
}

export const discordDispatcher = new DiscordDispatcher();
