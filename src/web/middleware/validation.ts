import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Campaign Creation Schema
export const campaignSchema = z.object({
  name: z.string().min(3).max(50),
  targetCountry: z.string().length(2).default('ZW'),
  locations: z.array(z.string()).min(1),
  industries: z.array(z.string()).min(1),
  productDescription: z.string().optional(),
  targetPainPoints: z.string().optional(),
  discordWebhook: z.string().url().optional().nullable(),
});

// Lead Status Update Schema
export const leadStatusSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'CONVERTED', 'REJECTED']),
});

export const campaignStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'PAUSED', 'EXHAUSTED']),
});

// Billing Checkout Schema
export const billingSchema = z.object({
  method: z.enum(['STRIPE', 'PAYNOW']),
  tier: z.enum(['STARTER', 'PROFESSIONAL', 'ELITE', 'CREDIT']),
  amount: z.number().optional(), // For credit topups
});

// Validation Middleware
export const validate = (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: error.issues.map((issue) => ({ path: issue.path, message: issue.message }))
      });
    }
    next(error);
  }
};
