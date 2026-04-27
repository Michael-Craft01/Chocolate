import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import prisma from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { config } from '../config.js';
import { paymentService } from '../services/paymentService.js';
import { WebhookHandler } from '../services/webhookHandler.js';
import { triggerEngineCycle } from '../services/discoveryEngine.js';
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
app.get('/api/me', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.user!.id;
        
        // Auto-sync any pending payments from Paynow
        await paymentService.syncPendingPayments(userId);
        
        // Fetch fresh data after sync
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
                campaigns: {
                    where: { name: 'Main Engine' },
                    take: 1
                }
            }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({
            id: user.id,
            email: user.email,
            paymentStatus: user.paymentStatus,
            tier: user.tier,
            onboardingComplete: user.profile?.onboardingComplete || false
        });
    } catch (error) {
        logger.error({ error }, 'Error in /api/me');
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API: Billing Transactions
app.get('/api/billing/transactions', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        logger.info({ userId }, 'Fetching transactions for user');
        
        const transactions = await prisma.transaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        
        return res.json(transactions);
    } catch (error) {
        logger.error({ error }, 'Error fetching transactions');
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


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
        
        // 1. Update Profile (Identity & Market)
        const profile = await prisma.profile.upsert({
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
        
        // 2. Update the "Main Engine" Campaign (Market Sync only)
        const existingCampaign = await prisma.campaign.findFirst({ where: { userId, name: 'Main Engine' } });
        
        const mainCampaign = await prisma.campaign.upsert({
            where: { 
                id: existingCampaign?.id || '00000000-0000-0000-0000-000000000000'
            },
            create: {
                userId,
                name: 'Main Engine',
                senderName: data.defaultSenderName || '',
                senderRole: data.defaultSenderRole || '',
                companyName: data.companyName || '',
                productName: 'My Main Service', // Default placeholder
                productDescription: 'Our primary offering as defined in the company profile.',
                targetPainPoints: 'Various industry challenges.',
                targetCountry: data.targetCountry || 'ZW',
                locations: data.locations || [],
                industries: data.industries || [],
                discordWebhook: data.discordWebhook,
                status: 'ACTIVE'
            },
            update: {
                senderName: data.defaultSenderName,
                senderRole: data.defaultSenderRole,
                companyName: data.companyName,
                targetCountry: data.targetCountry,
                locations: data.locations,
                industries: data.industries,
                discordWebhook: data.discordWebhook
            }
        });
        
        res.json({ success: true, profile, campaign: mainCampaign });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API: Campaigns
app.post('/api/campaigns/:id/trigger', authenticate, requireActiveSubscription, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const campaignId = req.params.id;
        logger.info(`[COMMAND CENTER] 🚀 Manual sweep request received for campaign: ${campaignId}`);
        const campaign = await prisma.campaign.findFirst({ where: { id: campaignId, userId }, include: { user: true } });
        if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
        logger.info({ userId, campaignId }, '🚀 Manual sweep triggered');
        triggerEngineCycle().catch(err => logger.error({ err }, 'Manual trigger failed'));
        res.json({ message: 'Lead sweep initiated successfully. AI is now hunting for leads.', timestamp: new Date().toISOString() });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

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




// API: Public Lead View (Magic Link)
app.get('/api/leads/public/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const lead = await prisma.lead.findUnique({
            where: { id },
            include: { 
                business: true,
                campaign: {
                    select: {
                        productName: true,
                        companyName: true,
                        senderName: true
                    }
                }
            }
        });
        
        if (!lead) return res.status(404).json({ error: 'Lead not found' });
        
        // Hide sensitive backend IDs
        res.json({
            name: lead.business.name,
            website: lead.business.website,
            phone: lead.business.phone,
            industry: lead.industry,
            painPoint: lead.painPoint,
            message: lead.suggestedMessage,
            product: lead.campaign.productName,
            company: lead.campaign.companyName,
            sender: lead.campaign.senderName,
            createdAt: lead.createdAt
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API: Export Leads (Document)
app.get('/api/leads/export', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
        const { campaignId, format = 'csv' } = req.query;
        const leads = await prisma.lead.findMany({
            where: { 
                campaign: { 
                    userId: req.user!.id,
                    id: campaignId ? String(campaignId) : undefined
                } 
            },
            include: { business: true }
        });

        const filename = `leads_${campaignId || 'all'}_${new Date().toISOString().split('T')[0]}`;

        if (format === 'json') {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}.json`);
            return res.json(leads);
        }

        // CSV / Excel (Robust formatting via json2csv)
        const fields = [
            { label: 'Company Name', value: 'business.name' },
            { label: 'Industry', value: 'industry' },
            { label: 'Phone', value: 'business.phone' },
            { label: 'Email', value: 'business.email' },
            { label: 'Website', value: 'business.website' },
            { label: 'Pain Point', value: 'painPoint' },
            { label: 'Suggested Message', value: 'suggestedMessage' },
            { label: 'Captured Date', value: (row: any) => row.createdAt.toISOString() }
        ];

        const { Parser } = await import('json2csv');
        const json2csvParser = new Parser({ fields });
        const content = json2csvParser.parse(leads);

        const contentType = format === 'excel' ? 'application/vnd.ms-excel' : 'text/csv';
        const extension = format === 'excel' ? 'xls' : 'csv';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.${extension}`);
        res.send(content);
    } catch (error) {
        logger.error({ error }, 'Export failed');
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API: Leads (Authenticated)
app.get('/api/leads', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
        const { campaignId } = req.query;
        const leads = await prisma.lead.findMany({
            where: { 
                campaign: { 
                    userId: req.user!.id,
                    id: campaignId ? String(campaignId) : undefined
                } 
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: { business: true, campaign: { select: { name: true } } }
        });
        res.json(leads);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API: Update Lead (Edit)
app.patch('/api/leads/:id', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
        const { id } = req.params;
        const { industry, painPoint, suggestedMessage, status } = req.body;
        
        // Ensure user owns the lead's campaign
        const lead = await prisma.lead.findFirst({
            where: { id, campaign: { userId: req.user!.id } }
        });

        if (!lead) return res.status(404).json({ error: 'Lead not found' });

        const updatedLead = await prisma.lead.update({
            where: { id },
            data: { 
                industry: industry || undefined,
                painPoint: painPoint || undefined,
                suggestedMessage: suggestedMessage || undefined,
                status: status || undefined
            }
        });

        res.json(updatedLead);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API: Delete Lead
app.delete('/api/leads/:id', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
        const { id } = req.params;
        
        const lead = await prisma.lead.findFirst({
            where: { id, campaign: { userId: req.user!.id } }
        });

        if (!lead) return res.status(404).json({ error: 'Lead not found' });

        await prisma.lead.delete({ where: { id } });
        res.json({ success: true });
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
        availableRoutes: ['/api/me', '/api/stats', '/api/settings', '/api/campaigns', '/api/leads', '/api/leads/export', '/api/leads/public/:id']
    });
});

export const startServer = () => {
    app.listen(PORT, () => {
        logger.info(`REST API server started on port ${PORT}`);
    });
};
