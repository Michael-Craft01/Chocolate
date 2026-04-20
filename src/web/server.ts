import express from 'express';
import cors from 'cors';
import prisma from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = new Set([
    config.FRONTEND_URL,
    'http://localhost:3001',
    'http://127.0.0.1:3001'
]);

app.use(cors({
    origin: (origin, callback) => {
        // Allow non-browser and same-origin requests
        if (!origin) {
            return callback(null, true);
        }
        if (allowedOrigins.has(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    }
}));

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Middleware for Stripe Webhook needs raw body
app.post('/api/payments/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    if (!stripe || !config.STRIPE_WEBHOOK_SECRET) {
        logger.error('Stripe is not configured for webhooks');
        return res.status(500).send('Stripe Config Missing');
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig as string,
            config.STRIPE_WEBHOOK_SECRET
        );
    } catch (err: any) {
        logger.error({ err }, 'Stripe Webhook Signature Verification Failed');
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as any;
            const { userId, tier } = session.metadata;
            
            logger.info({ userId, tier, sessionId: session.id }, 'Stripe Checkout Session Completed');
            
            if (tier === 'CREDIT') {
                await WebhookHandler.handleCreditTopup(userId, session.amount_total / 100, session.id, 'STRIPE');
            } else {
                await WebhookHandler.handleSubscriptionSuccess(userId, tier, session.id, 'STRIPE');
            }
        }
        
        res.json({ received: true });
    } catch (err: any) {
        logger.error({ err }, 'Error processing Stripe webhook event');
        res.status(500).send('Internal Processing Error');
    }
});

// All other routes use JSON body parsing
app.use(express.json());

import { campaignSchema, leadStatusSchema, campaignStatusSchema, billingSchema, validate } from './middleware/validation.js';
import { authenticate, AuthenticatedRequest } from './middleware/auth.js';
import Stripe from 'stripe';

const stripe = config.STRIPE_SECRET_KEY ? new Stripe(config.STRIPE_SECRET_KEY) : null;

// API: Dashboard Stats (Protected)
app.get('/api/stats', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.user!.id;
        
        // Global stats (for visibility)
        const totalBusinesses = await prisma.business.count();
        
        // Multi-tenant Lead Stats
        const totalLeads = await prisma.lead.count({
            where: { campaign: { userId } }
        });

        const startOfToday = new Date();
        startOfToday.setHours(0,0,0,0);
        const leadsToday = await prisma.lead.count({
            where: { 
                createdAt: { gte: startOfToday },
                campaign: { userId }
            }
        });

        // Current User Identity/Quota
        const user = await prisma.user.findUnique({ 
            where: { id: userId },
            include: { profile: true }
        });

        res.json({
            totalBusinesses,
            totalLeads,
            leadsToday,
            quota: {
                used: user?.leadsFoundToday || 0,
                limit: user?.dailyLimit || 50,
                credits: user?.creditBalance || 0
            }
        });
    } catch (error) {
        logger.error({ err: error }, 'Error fetching stats');
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API: Campaigns List (Protected)
app.get('/api/campaigns', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.user!.id;
        const campaigns = await prisma.campaign.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { leads: true } } }
        });
        res.json(campaigns);
    } catch (error) {
        logger.error({ err: error }, 'Error fetching campaigns');
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API: Create Campaign (Protected)
app.post('/api/campaigns', authenticate, validate(campaignSchema), async (req: AuthenticatedRequest, res) => {
    try {
        const data = req.body;
        const userId = req.user!.id;

        // Ensure user exists in our DB, if not create them (from Supabase Identity)
        await prisma.user.upsert({
            where: { id: userId },
            update: {},
            create: { id: userId, email: req.user!.email }
        });

        const campaign = await prisma.campaign.create({
            data: {
                ...data,
                userId
            }
        });
        res.status(201).json(campaign);
    } catch (error) {
        logger.error({ err: error }, 'Error creating campaign');
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API: Toggle Campaign Status (Protected)
app.patch('/api/campaigns/:id/status', authenticate, validate(campaignStatusSchema), async (req: AuthenticatedRequest, res) => {
    try {
        const { id } = req.params;
        if (typeof id !== 'string') {
            return res.status(400).json({ error: 'Validation Failed', message: 'Invalid campaign id' });
        }
        const { status } = req.body;
        const userId = req.user!.id;

        const updateResult = await prisma.campaign.updateMany({
            where: { id, userId },
            data: { status }
        });
        if (updateResult.count === 0) {
            return res.status(404).json({ error: 'Not Found', message: 'Campaign not found' });
        }

        const campaign = await prisma.campaign.findUnique({
            where: { id }
        });
        if (!campaign) {
            return res.status(404).json({ error: 'Not Found', message: 'Campaign not found' });
        }

        res.json(campaign);
    } catch (error) {
        logger.error({ err: error }, 'Error toggling campaign status');
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API: Leads List (Protected)
app.get('/api/leads', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.user!.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const leads = await prisma.lead.findMany({
            where: { campaign: { userId } },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: { business: true }
        });

        const totalLeads = await prisma.lead.count({
            where: { campaign: { userId } }
        });
        const totalPages = Math.ceil(totalLeads / limit);

        res.json({
            leads,
            pagination: { page, totalPages, totalLeads }
        });
    } catch (error) {
        logger.error({ err: error }, 'Error fetching leads');
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API: Lead Status Update (Protected)
app.patch('/api/leads/:id/status', authenticate, validate(leadStatusSchema), async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.user!.id;
        const { id } = req.params;
        if (typeof id !== 'string') {
            return res.status(400).json({ error: 'Validation Failed', message: 'Invalid lead id' });
        }
        const { status } = req.body;

        const updateResult = await prisma.lead.updateMany({
            where: { id, campaign: { userId } },
            data: { status }
        });
        if (updateResult.count === 0) {
            return res.status(404).json({ error: 'Not Found', message: 'Lead not found' });
        }

        const updatedLead = await prisma.lead.findUnique({
            where: { id }
        });
        if (!updatedLead) {
            return res.status(404).json({ error: 'Not Found', message: 'Lead not found' });
        }

        res.json(updatedLead);
    } catch (error) {
        logger.error({ err: error }, 'Error updating lead status');
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ... (previous imports)
import { paymentService } from '../services/paymentService.js';
import { WebhookHandler } from '../services/webhookHandler.js';
import { config } from '../config.js';
import { triggerEngineCycle } from '../index.js';

// API: Engine Trigger (For remote cron services like cronjob.com)
app.post('/api/engine/trigger', async (req, res) => {
    try {
        const { key } = req.query;

        if (key !== config.ENGINE_TRIGGER_SECRET) {
            logger.warn('Unauthorized engine trigger attempt');
            return res.status(401).json({ error: 'Unauthorized' });
        }

        logger.info('Engine sweep triggered via webhook');
        const results = await triggerEngineCycle();
        
        res.json({
            success: true,
            message: 'Sweep complete',
            results
        });
    } catch (error) {
        logger.error({ err: error }, 'Engine trigger error');
        const details = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: 'Internal Server Error', details });
    }
});

// Stripe Webhook handled above with raw body parser

// API: Paynow Result (Webhook)
app.post('/api/payments/paynow/result', express.urlencoded({ extended: true }), async (req, res) => {
    try {
        const payload = req.body;
        // Paynow sends: reference, amount, status, pollurl, hash
        if (payload.status === 'Paid') {
            // Find the transaction by reference or pollurl
            const transaction = await prisma.transaction.findFirst({
                where: { gatewayRef: payload.pollurl }
            });
            
            if (transaction && transaction.status !== 'SUCCESS') {
                if (transaction.type === 'CREDIT_TOPUP') {
                    await WebhookHandler.handleCreditTopup(transaction.userId, parseFloat(payload.amount), payload.reference, 'PAYNOW');
                } else {
                    // We'd need to map the reference back to a tier, or store it in the transaction
                    const tier = 'STARTER'; // Placeholder: Should be stored in transaction metadata
                    await WebhookHandler.handleSubscriptionSuccess(transaction.userId, tier, payload.reference, 'PAYNOW');
                }
            }
        }
        res.sendStatus(200);
    } catch (error: any) {
        logger.error({ err: error }, 'Error processing Paynow webhook');
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

// API: Create Checkout Session (Protected)
app.post('/api/billing/create-checkout', authenticate, validate(billingSchema), async (req: AuthenticatedRequest, res) => {
    try {
        const { method, tier, amount } = req.body;
        const userId = req.user!.id;

        logger.info({ userId, method, tier }, 'Creating checkout session');

        let url: string | null;
        if (method === 'STRIPE') {
            url = await paymentService.createStripeCheckout({ userId, tier, amount });
        } else {
            url = await paymentService.createPaynowCheckout({ userId, tier, amount });
        }
        if (!url) {
            return res.status(500).json({ error: 'Payment Service Error', message: 'Checkout URL not generated' });
        }

        res.json({ url });
    } catch (error: any) {
        logger.error({ err: error }, 'Error creating checkout session');
        res.status(500).json({ error: 'Payment Service Error', message: error.message });
    }
});

export const startServer = () => {
    app.listen(PORT, () => {
        logger.info(`REST API server started on port ${PORT}`);
    });
};
