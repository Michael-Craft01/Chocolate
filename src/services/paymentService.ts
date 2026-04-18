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
        if (!this.paynow) throw new Error('Paynow is not configured');

        const price = options.amount || this.getTierPrice(options.tier);
        const user = await prisma.user.findUnique({ where: { id: options.userId } });

        const payment = this.paynow.createPayment(`INV-${Date.now()}`, user?.email || 'sales@logic.hq');
        payment.add(`Chocolate ${options.tier} Plan`, price);

        try {
            const response = await this.paynow.send(payment);
            if (response.success) {
                // Save transaction as PENDING
                await prisma.transaction.create({
                    data: {
                        userId: options.userId,
                        amount: price,
                        gateway: 'PAYNOW',
                        type: options.tier === 'CREDIT' ? 'CREDIT_TOPUP' : 'SUBSCRIPTION',
                        gatewayRef: response.pollUrl,
                        status: 'PENDING',
                    }
                });
                return response.redirectUrl;
            } else {
                throw new Error('Paynow failed to initiate payment');
            }
        } catch (error) {
            logger.error({ err: error }, 'Paynow initiation error');
            throw error;
        }
    }
}

export const paymentService = new PaymentService();
