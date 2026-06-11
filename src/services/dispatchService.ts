import { logger } from '../lib/logger.js';
import { discordDispatcher } from './discordDispatcher.js';
import prisma from '../lib/prisma.js';
import { LeadStatus } from '@prisma/client';
import { Resend } from 'resend';
import { config } from '../config.js';
import { cleanOutreachMessage } from './aiService.js';

const resend = new Resend(config.RESEND_API_KEY);
const FROM_EMAIL = config.RESEND_FROM_EMAIL;

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

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
    /**
     * Manual Dispatch: Triggered by user in UI
     * Sends email to lead (if available) + returns WhatsApp deep-link
     */
    async dispatchLead(leadId: string, userId: string) {
        try {
            const lead = await prisma.lead.findUnique({
                where: { id: leadId },
                include: { business: true, campaign: true }
            });

            if (!lead || lead.campaign.userId !== userId) {
                throw new Error('Lead not found or access denied');
            }

            const business = lead.business;
            const outreachMessage = cleanOutreachMessage(lead.suggestedMessage);
            const escapedMessage = escapeHtml(outreachMessage).replace(/\n/g, '<br>');
            const escapedBusinessName = escapeHtml(business.name || 'there');
            const escapedWebsite = escapeHtml(business.website || 'website');
            const escapedSenderName = escapeHtml(lead.campaign.senderName || 'Michael');
            const escapedSenderRole = escapeHtml(lead.campaign.senderRole || 'Growth Lead');
            const escapedCompanyName = escapeHtml(lead.campaign.companyName || '');
            let emailSent = false;

            // 1. Send Email to Lead if email exists
            if (business.email) {
                try {
                    await resend.emails.send({
                        from: FROM_EMAIL,
                        to: business.email,
                        subject: `Outreach from ${lead.campaign.companyName}`,
                        html: `
                            <div style="font-family: sans-serif; font-size: 15px; line-height: 1.6; color: #111827; max-width: 600px; margin: 0 auto; text-align: left;">
                                <p>Hi ${escapedBusinessName},</p>
                                
                                <p>I was looking at your website (${escapedWebsite}) and noticed some details about your outreach vectors. I wanted to reach out directly with some specific business intelligence.</p>
                                
                                <div style="margin: 24px 0; padding-left: 16px; border-left: 2px solid #e5e7eb; color: #374151; font-style: italic;">
                                    ${escapedMessage}
                                </div>
                                
                                <p>If you're interested in exploring how we can streamline this or have any questions about these points, please let me know. I'd be happy to share more details.</p>
                                
                                <p>Best regards,<br>
                                ${escapedSenderName}<br>
                                ${escapedSenderRole}<br>
                                ${escapedCompanyName}</p>
                            </div>
                        `
                    });
                    emailSent = true;
                    logger.info(`[DISPATCH] Human-style text email sent to lead: ${business.email}`);
                } catch (e: any) {
                    logger.error({ err: e.message }, 'Failed to send lead email');
                }
            }

            // 2. Generate Manual Outreach Links
            let whatsappUrl = null;
            let mailtoUrl = null;
            let contactUrl = null;

            if (business.phone) {
                const cleanPhone = business.phone.replace(/\D/g, '');
                if (cleanPhone.length >= 7) {
                    whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(outreachMessage)}`;
                }
            }

            if (business.email) {
                const subject = encodeURIComponent(`Intelligence Report: ${business.name}`);
                const body = encodeURIComponent(outreachMessage);
                mailtoUrl = `mailto:${business.email}?subject=${subject}&body=${body}`;
            }

            const contactPages = Array.isArray(business.contactPages) ? business.contactPages.filter(Boolean) : [];
            const socialProfiles = Array.isArray(business.socialProfiles) ? business.socialProfiles.filter(Boolean) : [];
            contactUrl = contactPages[0] || socialProfiles[0] || null;

            // Clicking WhatsApp or Mail client links counts as a CONTACTED action immediately as requested
            const isContactAttempt = emailSent || Boolean(whatsappUrl) || Boolean(mailtoUrl);
            const status = isContactAttempt ? LeadStatus.CONTACTED : (contactUrl ? LeadStatus.CONTACT_ROUTE_OPENED : lead.status);
            const dispatchedAt = isContactAttempt ? new Date() : lead.dispatchedAt;

            // 3. Track the strongest action we can honestly prove.
            await prisma.lead.update({
                where: { id: leadId },
                data: { status, dispatchedAt }
            });

            return { emailSent, whatsappUrl, mailtoUrl, contactUrl, status };
        } catch (error: any) {
            logger.error({ err: error.message }, 'Manual Dispatch Error');
            throw error;
        }
    }

    /**
     * Cycle Summary: Sent to the platform USER after every engine cycle
     */
    async sendUserCycleSummary(userId: string, sweepResults: { campaignName: string, count: number }[]) {
        try {
            const user = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
            if (!user || !user.email) return;

            const totalFound = sweepResults.reduce((sum, r) => sum + r.count, 0);
            if (totalFound === 0) return;

            const name = user.profile?.defaultSenderName || 'Partner';
            
            // Format the list of campaign updates in a highly detailed, text-based list
            const campaignDetails = sweepResults
                .map(r => `• Campaign "${r.campaignName}" successfully identified and processed ${r.count} qualified prospects.`)
                .join('<br>');

            await resend.emails.send({
                from: FROM_EMAIL,
                to: user.email,
                subject: `HyprLead Scan Complete: ${totalFound} prospects identified`,
                html: `
                    <div style="font-family: sans-serif; font-size: 15px; line-height: 1.6; color: #111827; max-width: 600px; margin: 0 auto; text-align: left;">
                        <p>Hi ${name},</p>
                        
                        <p>I am writing to let you know that the automated lead discovery engine has just completed a full scanning cycle. We have successfully identified a total of ${totalFound} high-fidelity prospects ready for your pipeline.</p>
                        
                        <p>Here are the detailed updates from this sweep:</p>
                        
                        <p style="margin: 20px 0; padding-left: 12px; color: #374151; font-weight: 500; font-family: inherit;">
                            ${campaignDetails}
                        </p>
                        
                        <p>You can access all prospect details, view scraped contact intelligence, and trigger outreach scripts directly from your command center:</p>
                        
                        <p style="margin: 24px 0;">
                            <a href="${config.FRONTEND_URL}/leads" style="background-color: #10b981; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 9999px; font-size: 13px; font-weight: bold; display: inline-block;">
                                View Prospects Dashboard
                            </a>
                        </p>
                        
                        <p>The system will continue running background sweeps based on your default targeting settings to keep your pipeline consistently active. Please let me know if you need to adjust your targeting or configurations.</p>
                        
                        <p>Warm regards,<br>
                        HyprLead Operations Team<br>
                        Autonomous Outbound Infrastructure</p>
                    </div>
                `
            });

            logger.info(`[SUMMARY] Detailed text summary email sent to user: ${user.email}`);
        } catch (error: any) {
            logger.error({ err: error.message }, 'Cycle Summary Email Error');
        }
    }

    /**
     * Auto-dispatch to Discord (Legacy notification flow)
     */
    async notifyDiscord(payload: any) {
        const campaign = await prisma.campaign.findUnique({ where: { id: payload.campaignId } });
        if (campaign?.discordWebhook) {
            await discordDispatcher.dispatch(payload, 'warm', campaign.discordWebhook);
        }
    }

    /**
     * Auto-dispatch discovered lead to user campaign webhook
     */
    async dispatchLeadToDiscord(lead: any, campaign: any) {
        try {
            if (!campaign.discordWebhook) {
                logger.info(`[DISPATCH] No Discord webhook set for campaign "${campaign.name}"`);
                return false;
            }

            const business = await prisma.business.findUnique({ where: { id: lead.businessId } });
            if (!business) return false;

            const payload = {
                name: business.name,
                industry: lead.industry || business.category || 'General',
                painPoint: lead.painPoint || 'efficiency',
                message: lead.suggestedMessage,
                website: business.website,
                phone: business.phone,
                email: business.email,
                contactStatus: business.contactStatus,
                bestContactChannel: business.bestContactChannel,
                contactPages: Array.isArray(business.contactPages) ? business.contactPages as string[] : [],
                socialProfiles: Array.isArray(business.socialProfiles) ? business.socialProfiles as string[] : [],
                location: `${campaign.locations[0] || 'Unknown'}, ${campaign.targetCountry || 'ZW'}`
            };

            logger.info(`[DISPATCH] Automatically sending lead "${business.name}" to campaign Discord webhook`);
            return await discordDispatcher.dispatch(payload, 'warm', campaign.discordWebhook);
        } catch (error: any) {
            logger.error({ err: error.message }, 'Failed to auto-dispatch lead to Discord');
            return false;
        }
    }

    /**
     * Welcome Onboarding Email: Sent when a user completes their onboarding profile
     */
    async sendUserWelcomeEmail(userId: string) {
        try {
            const user = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
            if (!user || !user.email) return;

            const name = user.profile?.defaultSenderName || 'there';
            const companyName = user.profile?.companyName || 'your organization';

            await resend.emails.send({
                from: FROM_EMAIL,
                to: user.email,
                subject: `Setting up your HyprLead pipeline: Engine provisioned`,
                html: `
                    <div style="font-family: sans-serif; font-size: 15px; line-height: 1.6; color: #111827; max-width: 600px; margin: 0 auto; text-align: left;">
                        <p>Hi ${name},</p>
                        
                        <p>Welcome to HyprLead. I am writing to let you know that your sales intelligence engine has been successfully provisioned and calibrated for ${companyName}.</p>
                        
                        <p>We built HyprLead to automate the tedious parts of outbound sales. The platform uses stealth scraping and AI enrichment to find high-fidelity prospects and draft outbound outreach copies tailored specifically to their business context.</p>
                        
                        <p>To help you get the most out of your setup, here are the detailed next steps to fully activate your pipeline:</p>
                        
                        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 24px 0;">
                            <p style="margin-top: 0; font-weight: bold; color: #111827;">1. Refine your Search Target</p>
                            <p style="margin-bottom: 16px; font-size: 14px; color: #4b5563;">Make sure your core industry sector, default region, and cities are correctly configured in your Settings dashboard. This directly coordinates the scraping boundaries of the AI sweeps.</p>
                            
                            <p style="font-weight: bold; color: #111827;">2. Connect a Discord Webhook</p>
                            <p style="margin-bottom: 16px; font-size: 14px; color: #4b5563;">If you configure a Discord webhook, the engine will push newly discovered prospects to your chat channel in real-time, complete with WhatsApp launch shortcuts.</p>
                            
                            <p style="font-weight: bold; color: #111827;">3. Launch outreach dispatches</p>
                            <p style="margin-bottom: 0; font-size: 14px; color: #4b5563;">Review the pre-drafted message drafts on your Your Leads page and launch SMTP email dispatches or WhatsApp messages with a single click.</p>
                        </div>
                        
                        <p>You can enter your command center directly here:</p>
                        
                        <p style="margin: 24px 0;">
                            <a href="${config.FRONTEND_URL}/dashboard" style="background-color: #10b981; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 9999px; font-size: 13px; font-weight: bold; display: inline-block;">
                                Go to Dashboard
                            </a>
                        </p>
                        
                        <p>If you have any questions or need help fine-tuning your search scopes, feel free to reply directly to this email. I am always happy to help.</p>
                        
                        <p>Best regards,<br>
                        Michael<br>
                        Onboarding Operations, HyprLead</p>
                    </div>
                `
            });

            logger.info(`[WELCOME] Detailed welcome text email sent to user: ${user.email}`);
        } catch (error: any) {
            logger.error({ err: error.message }, 'Failed to send Welcome email');
        }
    }
}

export const dispatchService = new DispatchService();
