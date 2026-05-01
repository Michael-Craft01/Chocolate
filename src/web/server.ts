import express, { Response } from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import prisma from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { config } from '../config.js';
import { paymentService } from '../services/paymentService.js';
import { WebhookHandler } from '../services/webhookHandler.js';
import { PaymentSyncService } from '../services/paymentSyncService.js';
import { triggerEngineCycle } from '../services/discoveryEngine.js';
import { aiService } from '../services/aiService.js';
import { dispatchService } from '../services/dispatchService.js';
import { 
    campaignSchema, 
    updateCampaignSchema,
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
const PORT = 3005; 
const stripe = config.STRIPE_SECRET_KEY ? new Stripe(config.STRIPE_SECRET_KEY) : null;

// CORS configuration
const allowedOrigins = new Set([
    config.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
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

// Request Logger
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Stripe Webhook
app.post(['/api/payments/stripe/webhook', '/api/webhooks/stripe'], express.raw({ type: 'application/json' }), async (req: any, res: any) => {
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

app.use(express.json());

// --- AUTHORITATIVE DECOMMISSIONING PROTOCOL ---
app.delete('/api/campaigns/:id', authenticate, async (req: any, res: any) => {
    const id = String(req.params.id);
    const userId = req.user!.id;
    const timestamp = new Date().toLocaleTimeString();

    logger.info(`[LIFECYCLE] ${timestamp} | 🛑 AUTHORITATIVE DROP: ${id}`);

    try {
        const campaign = await prisma.campaign.findFirst({ where: { id, userId } });
        if (!campaign) return res.status(404).json({ error: 'Search Hub not found' });

        await prisma.$transaction([
            prisma.lead.deleteMany({ where: { campaignId: id } }),
            prisma.queryHistory.deleteMany({ where: { campaignId: id } }),
            prisma.campaign.delete({ where: { id } })
        ]);

        logger.info(`[LIFECYCLE] ${timestamp} | ✅ DROP COMPLETE: ${id}`);
        res.json({ success: true, message: 'Hub decommissioned' });
    } catch (err: any) {
        logger.error(`[LIFECYCLE] ❌ DROP FAILED:`, err.message);
        res.status(500).json({ error: 'Decommission failed', details: err.message });
    }
});

// API: Current User Context
app.get('/api/me', authenticate, async (req: any, res: any) => {
    try {
        const userId = req.user!.id;
        const email = req.user!.email;
        
        let user = await prisma.user.findUnique({ 
            where: { id: userId },
            include: { 
                profile: true,
                campaigns: { where: { name: 'Main Engine' }, take: 1 }
            }
        });

        if (!user && email) {
            user = await prisma.user.upsert({
                where: { id: userId },
                update: { email: email },
                create: { id: userId, email: email },
                include: { profile: true, campaigns: { where: { name: 'Main Engine' }, take: 1 } }
            });
        }

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({
            id: user.id,
            email: user.email,
            paymentStatus: user.paymentStatus,
            tier: user.tier,
            onboardingComplete: user.profile?.onboardingComplete || false,
            createdAt: user.createdAt
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API: Billing Transactions
app.get('/api/billing/transactions', authenticate, async (req: any, res: any) => {
    try {
        const userId = req.user!.id;
        const transactions = await prisma.transaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        return res.json(transactions);
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/stats', authenticate, async (req: any, res: any) => {
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
            tier: user?.tier || 'FREE',
            quota: {
                used: user?.leadsFoundToday || 0,
                limit: user?.dailyLimit || 10,
                credits: user?.creditBalance || 0
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/campaigns/hub/:id', authenticate, async (req: any, res: any) => {
    try {
        const id = String(req.params.id);
        const userId = req.user!.id;
        const campaign = await prisma.campaign.findFirst({
            where: { id, userId },
            include: { _count: { select: { leads: true } } }
        });
        if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
        res.json(campaign);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API: Settings
app.get('/api/settings', authenticate, async (req: any, res: any) => {
    try {
        const userId = req.user!.id;
        const profile = await prisma.profile.findUnique({ where: { userId } });
        const mainCampaign = await prisma.campaign.findFirst({ where: { userId, name: 'Main Engine' } });
        res.json({ profile, campaign: mainCampaign });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/settings', authenticate, validate(settingsSchema), async (req: any, res: any) => {
    try {
        const userId = req.user!.id;
        const data = req.body;
        const profile = await prisma.profile.upsert({
            where: { userId },
            create: { ...data, userId, onboardingComplete: true },
            update: { ...data }
        });
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API: Campaigns
app.get('/api/campaigns', authenticate, async (req: any, res: any) => {
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

app.get('/api/campaigns/:id', authenticate, async (req: any, res: any) => {
    try {
        const id = String(req.params.id);
        const userId = req.user!.id;
        const campaign = await prisma.campaign.findFirst({
            where: { id, userId },
            include: { _count: { select: { leads: true } } }
        });
        if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
        res.json(campaign);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/campaigns', authenticate, requireActiveSubscription, validate(campaignSchema), async (req: any, res: any) => {
    try {
        const userId = req.user!.id;
        const campaign = await prisma.campaign.create({
            data: { ...req.body, userId }
        });
        res.status(201).json(campaign);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.patch('/api/campaigns/:id', authenticate, requireActiveSubscription, validate(updateCampaignSchema), async (req: any, res: any) => {
    try {
        const id = String(req.params.id);
        const userId = req.user!.id;
        const updated = await prisma.campaign.updateMany({
            where: { id, userId },
            data: req.body
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/campaigns/:id/trigger', authenticate, requireActiveSubscription, async (req: any, res: any) => {
    try {
        const userId = req.user!.id;
        const id = String(req.params.id);
        const campaign = await prisma.campaign.findFirst({ where: { id, userId } });
        if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
        triggerEngineCycle().catch(err => logger.error({ err }, 'Manual trigger failed'));
        res.json({ message: 'Lead sweep initiated successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API: Leads
app.get('/api/leads', authenticate, async (req: any, res: any) => {
    try {
        const campaignId = req.query.campaignId ? String(req.query.campaignId) : undefined;
        const page = parseInt(String(req.query.page || '1'));
        const limit = parseInt(String(req.query.limit || '50'));

        const where = { 
            campaign: { 
                userId: req.user!.id,
                id: campaignId
            } 
        };

        const [leads, totalLeads] = await Promise.all([
            prisma.lead.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: { business: true, campaign: { select: { name: true } } }
            }),
            prisma.lead.count({ where })
        ]);

        res.json({
            leads,
            pagination: { page, limit, totalPages: Math.ceil(totalLeads / limit), totalLeads }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/leads/export', authenticate, async (req: any, res: any) => {
    try {
        const campaignId = req.query.campaignId ? String(req.query.campaignId) : undefined;
        const leads = await prisma.lead.findMany({
            where: { campaign: { userId: req.user!.id, id: campaignId } },
            include: { business: true }
        });

        // @ts-ignore
        const { Parser } = await import('json2csv');
        const fields = ['business.name', 'industry', 'business.phone', 'business.email', 'business.website', 'painPoint'];
        const json2csvParser = new Parser({ fields } as any);
        const csv = json2csvParser.parse(leads);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/leads/:id/dispatch', authenticate, async (req: any, res: any) => {
    try {
        const id = String(req.params.id);
        const result = await dispatchService.dispatchLead(id, req.user!.id);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

app.patch('/api/leads/:id', authenticate, async (req: any, res: any) => {
    try {
        const id = String(req.params.id);
        const updated = await prisma.lead.updateMany({
            where: { id, campaign: { userId: req.user!.id } },
            data: req.body
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/api/leads/:id', authenticate, async (req: any, res: any) => {
    try {
        const id = String(req.params.id);
        await prisma.lead.deleteMany({
            where: { id, campaign: { userId: req.user!.id } }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Engine Trigger
app.post('/api/engine/trigger', async (req: any, res: any) => {
    try {
        if (req.query.key !== config.ENGINE_TRIGGER_SECRET) return res.status(401).json({ error: 'Unauthorized' });
        const results = await triggerEngineCycle();
        res.json({ success: true, results });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export const startServer = () => {
    return app.listen(PORT, () => {
        logger.info(`🚀 Mission Control Backend live at http://localhost:${PORT}`);
    });
};
