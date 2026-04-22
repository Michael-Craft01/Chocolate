import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import prisma from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { config } from '../config.js';
import { paymentService } from '../services/paymentService.js';
import { WebhookHandler } from '../services/webhookHandler.js';
import { triggerEngineCycle } from '../index.js';
import { 
    campaignSchema, 
    leadStatusSchema, 
    campaignStatusSchema, 
    billingSchema, 
    settingsSchema, 
    validate 
} from './middleware/validation.js';
import { 
    authenticate, 
    requireActiveSubscription, 
    AuthenticatedRequest 
} from './middleware/auth.js';

const app = express();
const PORT = 3005; // Forced to 3005 to avoid port 3000 conflict
const stripe = config.STRIPE_SECRET_KEY ? new Stripe(config.STRIPE_SECRET_KEY) : null;

// CORS configuration
const allowedOrigins = new Set([
    config.FRONTEND_URL,
    'http://localhost:3001',
    'http://127.0.0.1:3001'
]);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    }
}));

// Request Logger for debugging 404s
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// Traffic Monitor - See exactly what hits the engine
app.use((req, res, next) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[ENGINE] ${timestamp} | ${req.method} ${req.url}`);
    next();
});

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Stripe Webhook (needs raw body)
app.post('/api/payments/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    if (!stripe || !config.STRIPE_WEBHOOK_SECRET) return res.status(500).send('Stripe Config Missing');

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig as string, config.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as any;
            const { userId, tier } = session.metadata;
            if (tier === 'CREDIT') {
                await WebhookHandler.handleCreditTopup(userId, session.amount_total / 100, session.id, 'STRIPE');
            } else {
                await WebhookHandler.handleSubscriptionSuccess(userId, tier, session.id, 'STRIPE');
            }
        } else if (event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object as any;
            const userId = subscription.metadata?.userId;
            if (userId) {
                await prisma.user.update({
                    where: { id: userId },
                    data: { paymentStatus: 'canceled', tier: 'STARTER', dailyLimit: 10, maxCampaigns: 1 }
                });
            }
        }
        res.json({ received: true });
    } catch (err: any) {
        res.status(500).send('Internal Processing Error');
    }
});

// JSON parsing for all other routes
app.use(express.json());

// API: Current User Context
app.get('/api/me', authenticate, (req: AuthenticatedRequest, res) => {
    res.json({
        id: req.user!.id,
        email: req.user!.email,
        paymentStatus: req.user!.paymentStatus,
        tier: req.user!.tier
    });
});

// API: Dashboard Stats
app.get('/api/stats', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.user!.id;
        const totalBusinesses = await prisma.business.count();
        const totalLeads = await prisma.lead.count({ where: { campaign: { userId } } });
        
        const startOfToday = new Date();
        startOfToday.setHours(0,0,0,0);
        const leadsToday = await prisma.lead.count({
            where: { createdAt: { gte: startOfToday }, campaign: { userId } }
        });

        const user = await prisma.user.findUnique({ where: { id: userId } });
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
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API: Settings
app.get('/api/settings', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.user!.id;
        const profile = await prisma.profile.findUnique({ where: { userId } });
        const mainCampaign = await prisma.campaign.findFirst({ where: { userId, name: 'Main Engine' } });
        res.json({ profile, campaign: mainCampaign });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/settings', authenticate, validate(settingsSchema), async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.user!.id;
        const data = req.body;
        
        await prisma.profile.upsert({
            where: { userId },
            create: {
                userId,
                companyName: data.companyName,
                website: data.website,
                industry: data.industry,
                defaultSenderName: data.defaultSenderName,
                defaultSenderRole: data.defaultSenderRole,
                onboardingComplete: true
            },
            update: {
                companyName: data.companyName,
                website: data.website,
                industry: data.industry,
                defaultSenderName: data.defaultSenderName,
                defaultSenderRole: data.defaultSenderRole,
                onboardingComplete: true
            }
        });
        
        const mainCampaign = await prisma.campaign.upsert({
            where: { 
                id: (await prisma.campaign.findFirst({ where: { userId, name: 'Main Engine' } }))?.id || 'new-id'
            },
            create: {
                userId,
                name: 'Main Engine',
                senderName: data.defaultSenderName,
                senderRole: data.defaultSenderRole,
                companyName: data.companyName,
                productName: data.productName,
                productDescription: data.productDescription,
                targetPainPoints: data.targetPainPoints,
                targetCountry: data.targetCountry,
                locations: data.locations,
                industries: data.industries,
                discordWebhook: data.discordWebhook,
                status: 'ACTIVE'
            },
            update: {
                senderName: data.defaultSenderName,
                senderRole: data.defaultSenderRole,
                companyName: data.companyName,
                productName: data.productName,
                productDescription: data.productDescription,
                targetPainPoints: data.targetPainPoints,
                targetCountry: data.targetCountry,
                locations: data.locations,
                industries: data.industries,
                discordWebhook: data.discordWebhook
            }
        });
        
        res.json({ success: true, campaign: mainCampaign });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API: Campaigns
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
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/campaigns', authenticate, requireActiveSubscription, validate(campaignSchema), async (req: AuthenticatedRequest, res) => {
    try {
        const campaign = await prisma.campaign.create({
            data: { ...req.body, userId: req.user!.id }
        });
        res.status(201).json(campaign);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.patch('/api/campaigns/:id/status', authenticate, requireActiveSubscription, validate(campaignStatusSchema), async (req: AuthenticatedRequest, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await prisma.campaign.updateMany({ where: { id, userId: req.user!.id }, data: { status } });
        res.json({ status });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API: Leads
app.get('/api/leads', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
        const leads = await prisma.lead.findMany({
            where: { campaign: { userId: req.user!.id } },
            take: 50,
            include: { business: true }
        });
        res.json(leads);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API: Engine Trigger
app.post('/api/engine/trigger', async (req, res) => {
    try {
        const { key } = req.query;
        if (key !== config.ENGINE_TRIGGER_SECRET) return res.status(401).json({ error: 'Unauthorized' });
        const results = await triggerEngineCycle();
        res.json({ success: true, results });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API: Paynow Webhook
app.post('/api/payments/paynow/result', express.urlencoded({ extended: true }), async (req, res) => {
    try {
        const payload = req.body;
        const transaction = await prisma.transaction.findUnique({ where: { gatewayRef: payload.pollurl } });
        if (!transaction || transaction.status === 'SUCCESS') return res.sendStatus(200);

        const status = await paymentService.verifyPaynowTransaction(payload.pollurl);
        if (status.status === 'Paid') {
            if (transaction.type === 'CREDIT_TOPUP') {
                await WebhookHandler.handleCreditTopup(transaction.userId, parseFloat(status.amount), status.reference, 'PAYNOW');
            } else {
                await WebhookHandler.handleSubscriptionSuccess(transaction.userId, transaction.tier || 'STARTER', status.reference, 'PAYNOW');
            }
        }
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }
});

// API: Billing
app.post('/api/billing/create-checkout', authenticate, validate(billingSchema), async (req: AuthenticatedRequest, res) => {
    try {
        const { method, tier, amount } = req.body;
        const url = method === 'STRIPE' 
            ? await paymentService.createStripeCheckout({ userId: req.user!.id, tier, amount })
            : await paymentService.createPaynowCheckout({ userId: req.user!.id, tier, amount });
        
        if (!url) return res.status(500).json({ error: 'Checkout error' });
        res.json({ url });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Emergency 404 Catch-all (Keep this at the very bottom)
app.use((req, res) => {
    const timestamp = new Date().toLocaleTimeString();
    console.warn(`[ENGINE 404] ${timestamp} | ${req.method} ${req.url} - No route matched!`);
    res.status(404).json({ 
        error: 'Not Found', 
        message: `The engine does not recognize ${req.method} ${req.url}`,
        availableRoutes: ['/api/me', '/api/stats', '/api/settings', '/api/campaigns', '/api/leads']
    });
});

export const startServer = () => {
    app.listen(PORT, () => {
        logger.info(`REST API server started on port ${PORT}`);
    });
};
