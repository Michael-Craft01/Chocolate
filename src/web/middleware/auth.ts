import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config.js';
import { logger } from '../../lib/logger.js';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email?: string;
    };
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
        const decoded = jwt.verify(token, config.SUPABASE_JWT_SECRET) as any;
        
        // Supabase JWTs store the userId in the 'sub' field
        req.user = {
            id: decoded.sub,
            email: decoded.email
        };

        next();
    } catch (err) {
        logger.error({ err }, 'JWT Verification failed');
        return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
    }
};
