import Stripe from 'stripe';
import { Paynow } from 'paynow';
import { config } from '../config.js';
import prisma from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export type PaymentMethod = 'STRIPE' | 'PAYNOW';

interface CheckoutOptions {
    userId: string;
    tier: 'STARTER' | 'PROFESSIONAL' | 'ELITE' | 'CREDIT';
    amount?: number; // Used for credit top-ups
}

class PaymentService {
    private stripe?: Stripe;
    private paynow?: any;

    constructor() {
        if (config.STRIPE_SECRET_KEY) {
            this.stripe = new Stripe(config.STRIPE_SECRET_KEY);
        }
        if (config.PAYNOW_INTEGRATION_ID && config.PAYNOW_INTEGRATION_KEY) {
            this.paynow = new Paynow(config.PAYNOW_INTEGRATION_ID, config.PAYNOW_INTEGRATION_KEY);
            // Result URL is where Paynow POSTS transaction updates
            this.paynow.resultUrl = `${config.FRONTEND_URL}/api/payments/paynow/result`;
            this.paynow.returnUrl = `${config.FRONTEND_URL}/billing`;
        }
    }

    private getTierPrice(tier: string): number {
        switch (tier) {
            case 'STARTER': return 20;
            case 'PROFESSIONAL': return 49;
            case 'ELITE': return 300;
            default: return 0;
        }
    }

    async createStripeCheckout(options: CheckoutOptions) {
        if (!this.stripe) throw new Error('Stripe is not configured');

        const price = this.getTierPrice(options.tier);
        
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: (await prisma.user.findUnique({ where: { id: options.userId } }))?.email || undefined,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Chocolate Lead Engine - ${options.tier} Plan`,
                        },
                        unit_amount: price * 100,
                        recurring: options.tier !== 'CREDIT' ? { interval: 'month' } : undefined,
                    },
                    quantity: 1,
                },
            ],
            mode: options.tier !== 'CREDIT' ? 'subscription' : 'payment',
            success_url: `${config.FRONTEND_URL}/billing?success=true`,
            cancel_url: `${config.FRONTEND_URL}/billing?canceled=true`,
            metadata: {
                userId: options.userId,
                tier: options.tier,
            },
        });

        return session.url;
    }

    async createPaynowCheckout(options: CheckoutOptions) {
        if (!this.paynow) {
            logger.error('Paynow attempt made but no keys are configured in .env');
            throw new Error('Paynow is not configured. Check your .env file for INTEGRATION_ID and KEY.');
        }

        const price = options.amount || this.getTierPrice(options.tier);
        const user = await prisma.user.findUnique({ where: { id: options.userId } });

        // Ensure the result URL points to the BACKEND (3005), not the frontend (3001)
        this.paynow.resultUrl = `${config.BACKEND_URL}/api/payments/paynow/result`;
        this.paynow.returnUrl = `${config.FRONTEND_URL}/billing?success=true`;

        const payment = this.paynow.createPayment(`INV-${Date.now()}`, user?.email || 'customer@chocolate.engine');
        payment.add(`Chocolate ${options.tier} Plan`, price);

        try {
            const response = await this.paynow.send(payment);
            if (response.success) {
                logger.info({ pollUrl: response.pollUrl }, 'Paynow checkout initiated successfully');
                await prisma.transaction.create({
                    data: {
                        userId: options.userId,
                        amount: price,
                        gateway: 'PAYNOW',
                        type: options.tier === 'CREDIT' ? 'CREDIT_TOPUP' : 'SUBSCRIPTION',
                        tier: options.tier === 'CREDIT' ? null : options.tier as any,
                        gatewayRef: response.pollUrl,
                        status: 'PENDING',
                    }
                });
                return response.redirectUrl;
            } else {
                logger.error({ response }, 'Paynow rejected the payment initiation');
                throw new Error(`Paynow Error: ${response.error || 'Unknown initiation error'}`);
            }
        } catch (error: any) {
            logger.error({ err: error.message }, 'Critical Paynow initiation failure');
            throw error;
        }
    }

    async verifyPaynowTransaction(pollUrl: string) {
        if (!this.paynow) throw new Error('Paynow is not configured');
        
        try {
            const status = await this.paynow.pollTransaction(pollUrl);
            return status; // Returns object with status, amount, reference, etc.
        } catch (error) {
            logger.error({ err: error, pollUrl }, 'Error polling Paynow status');
            throw error;
        }
    }
    async syncPendingPayments(userId: string) {
        const pending = await prisma.transaction.findMany({
            where: { userId, status: 'PENDING', gateway: 'PAYNOW' },
            orderBy: { createdAt: 'desc' }
        });

        if (pending.length === 0) return;

        logger.info({ userId, count: pending.length }, '🔍 [PAYNOW SYNC] Checking pending transactions...');

        for (const tx of pending) {
            try {
                const statusResponse = await this.paynow.pollTransaction(tx.gatewayRef!);
                
                // CRITICAL: Log exactly what Paynow says for debugging
                logger.info({ 
                    txId: tx.id, 
                    paynowStatus: statusResponse.status,
                    paynowError: statusResponse.error 
                }, '📊 [PAYNOW SYNC] Status received');

                const currentStatus = statusResponse.status.toLowerCase();
                const successStatuses = ['paid', 'awaiting delivery', 'delivered'];
                
                if (successStatuses.includes(currentStatus)) {
                    await prisma.$transaction([
                        prisma.transaction.update({
                            where: { id: tx.id },
                            data: { status: 'SUCCESS' }
                        }),
                        prisma.user.update({
                            where: { id: userId },
                            data: { 
                                paymentStatus: 'active',
                                tier: tx.tier || 'STARTER'
                            }
                        })
                    ]);
                    logger.info({ userId, txId: tx.id }, '✅ [PAYNOW SYNC] Payment upgraded successfully!');
                }
            } catch (err: any) {
                logger.error({ err: err.message, txId: tx.id }, '❌ [PAYNOW SYNC] Polling failed');
            }
        }
    }
}

export const paymentService = new PaymentService();
