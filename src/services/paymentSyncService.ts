import { WebhookHandler } from './webhookHandler.js';
import { paymentService } from './paymentService.js';
import prisma from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import Stripe from 'stripe';
import { config } from '../config.js';

const stripe = config.STRIPE_SECRET_KEY ? new Stripe(config.STRIPE_SECRET_KEY) : null;

export class PaymentSyncService {
    /**
     * Force-syncs a user's subscription status by checking recent Stripe sessions
     * This is the ultimate fallback if webhooks fail.
     */
    static async syncStripeSubscription(userId: string) {
        if (!stripe) return { success: false, message: 'Stripe not configured' };

        try {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user || !user.email) return { success: false, message: 'User or email missing' };

            logger.info({ userId, email: user.email }, '🔄 Manually syncing Stripe subscription');

            // Search for successful checkout sessions for this email
            const sessions = await stripe.checkout.sessions.list({
                limit: 5,
                customer_details: { email: user.email }
            });

            const successfulSession = sessions.data.find(s => s.status === 'complete' && s.payment_status === 'paid');

            if (!successfulSession) {
                return { success: false, message: 'No successful sessions found for this email.' };
            }

            const tier = successfulSession.metadata?.tier || 'STARTER';
            
            // Re-use the webhook logic to provision the account
            await WebhookHandler.handleSubscriptionSuccess(userId, tier, successfulSession.id, 'STRIPE');

            return { success: true, tier };
        } catch (error: any) {
            logger.error({ error: error.message }, 'Sync failed');
            return { success: false, error: error.message };
        }
    }
}
