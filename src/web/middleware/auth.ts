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
        // Let Supabase verify the token — no algorithm guessing needed
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            logger.error({ error: error?.message }, 'Supabase token verification failed');
            return res.status(401).json({ error: 'Unauthorized', message: error?.message || 'Invalid token' });
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

    const allowedStatuses = ['active', 'free', 'trialing'];
    if (!req.user.paymentStatus || !allowedStatuses.includes(req.user.paymentStatus)) {
        logger.warn({ userId: req.user.id, status: req.user.paymentStatus }, 'Blocked: invalid subscription status');
        return res.status(403).json({ 
            error: 'Payment Required', 
            message: 'An active subscription is required'
        });
    }

    next();
};
