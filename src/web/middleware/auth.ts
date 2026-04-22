import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
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

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.warn('Unauthorized access attempt: No Bearer token provided');
        return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Missing token' });
    }

    try {
        const decoded = jwt.verify(token, config.SUPABASE_JWT_SECRET, { algorithms: ['HS256'] }) as any;
        
        const userId = decoded.sub;
        const userEmail = decoded.email;

        // ... provision logic ...
        const user = await prisma.user.upsert({
            where: { id: userId },
            update: { email: userEmail },
            create: { id: userId, email: userEmail }
        });

        req.user = { id: user.id, email: user.email || undefined, paymentStatus: user.paymentStatus, tier: user.tier };
        next();
    } catch (err: any) {
        logger.error({ 
            msg: 'JWT Verification failed', 
            error: err.message,
            receivedTokenPrefix: token.substring(0, 10) + '...',
            usingSecret: config.SUPABASE_JWT_SECRET === 'placeholder-jwt-secret' ? 'PLACEHOLDER' : 'REAL_SECRET'
        });
        return res.status(401).json({ error: 'Unauthorized', message: `Auth failed: ${err.message}` });
    }
};

export const requireActiveSubscription = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
    }

    const allowedStatuses = ['active', 'free', 'trialing'];
    if (!req.user.paymentStatus || !allowedStatuses.includes(req.user.paymentStatus)) {
        logger.warn({ userId: req.user.id, status: req.user.paymentStatus }, 'Blocked access due to invalid subscription status');
        return res.status(403).json({ 
            error: 'Payment Required', 
            message: 'An active or free subscription is required to perform this action' 
        });
    }

    next();
};
