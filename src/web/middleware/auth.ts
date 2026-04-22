import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { config } from '../../config.js';
import { logger } from '../../lib/logger.js';
import prisma from '../../lib/prisma.js';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email?: string;
        paymentStatus?: string;
        tier?: string;
    };
}

// Use Supabase SDK to verify tokens — handles RS256/HS256 automatically
const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Missing token' });
    }

    try {
        let user = null;
        let authError = null;
        let attempts = 0;

        while (attempts < 3) {
        try {
            const { data, error } = await supabase.auth.getUser(token);
            user = data.user;
            authError = error;
            if (user || (authError && authError.status !== 500)) break;
        } catch (err) {
            logger.warn(`Auth attempt ${attempts + 1} failed, retrying...`);
        }
        attempts++;
        if (attempts < 3) await new Promise(r => setTimeout(r, 500));
    }

    if (authError || !user) {
        logger.error({ error: authError?.message }, 'Supabase token verification failed');
        return res.status(401).json({ error: 'Unauthorized', message: authError?.message || 'Invalid token' });
    }

        // Sync user to our database
        const dbUser = await prisma.user.upsert({
            where: { id: user.id },
            update: { email: user.email },
            create: { id: user.id, email: user.email }
        });

        req.user = {
            id: dbUser.id,
            email: dbUser.email || undefined,
            paymentStatus: dbUser.paymentStatus,
            tier: dbUser.tier
        };

        next();
    } catch (err: any) {
        logger.error({ err: err.message }, 'Auth middleware error');
        return res.status(401).json({ error: 'Unauthorized', message: err.message });
    }
};

export const requireActiveSubscription = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
    }

    const status = (req.user.paymentStatus || '').toLowerCase();
    const allowedStatuses = ['active', 'free', 'trialing', 'success'];
    const isProOrElite = ['PROFESSIONAL', 'ELITE'].includes(req.user.tier || '');

    if (!allowedStatuses.includes(status) && !isProOrElite) {
        logger.warn({ userId: req.user.id, status: req.user.paymentStatus, tier: req.user.tier }, 'Blocked: invalid subscription status');
        return res.status(403).json({ 
            error: 'Payment Required', 
            message: 'An active subscription is required to launch a sweep.'
        });
    }

    next();
};
