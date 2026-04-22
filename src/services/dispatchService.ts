import { logger } from '../lib/logger.js';
import { discordDispatcher } from './discordDispatcher.js';
import prisma from '../lib/prisma.js';

export interface DispatchPayload {
    leadId: string;
    campaignId: string;
    userId: string;
    name: string;
    industry: string;
    painPoint: string;
    message: string;
    phone?: string | null;
    website?: string | null;
    location: string;
}

export class DispatchService {
    async dispatch(payload: DispatchPayload) {
        try {
            // 1. Fetch User & Campaign for configuration
            const [user, campaign] = await Promise.all([
                prisma.user.findUnique({ where: { id: payload.userId } }),
                prisma.campaign.findUnique({ where: { id: payload.campaignId } })
            ]);

            if (!user || !campaign) {
                logger.warn(`Dispatch failed: User or Campaign not found for lead ${payload.leadId}`);
                return;
            }

            // 2. DISCORD DISPATCH (Technical Users)
            if (campaign.discordWebhook || user.creditBalance > 0) {
                await discordDispatcher.dispatch({
                    name: payload.name,
                    industry: payload.industry,
                    painPoint: payload.painPoint,
                    message: payload.message,
                    phone: payload.phone,
                    website: payload.website,
                    location: payload.location
                }, 'warm', campaign.discordWebhook);
            }

            // 3. EMAIL DISPATCH (The "Magic Link" - All Tiers)
            // Note: In a real app, you'd use Resend/Nodemailer here.
            // For now, we log the "Magic Link" that would be sent.
            const magicLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/leads/view/${payload.leadId}`;
            logger.info(`[EMAIL SENT] To: ${user.email} | Magic Link: ${magicLink}`);

            // 4. WHATSAPP DISPATCH (ELITE ONLY)
            if (user.tier === 'ELITE') {
                await this.sendWhatsAppAlert(user, payload);
            }

            // Mark lead as dispatched
            await prisma.lead.update({
                where: { id: payload.leadId },
                data: { dispatchedAt: new Date() }
            });

        } catch (error: any) {
            logger.error({ err: error.message }, 'Dispatch Service Error');
        }
    }

    private async sendWhatsAppAlert(user: any, lead: DispatchPayload) {
        // Placeholder for WhatsApp API (e.g., Twilio or Whapi)
        logger.info(`[WHATSAPP SENT] To Elite User ${user.email} for lead ${lead.name}`);
        // Implementation: axios.post('WHATSAPP_API_URL', { ... })
    }
}

export const dispatchService = new DispatchService();
