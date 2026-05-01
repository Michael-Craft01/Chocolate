import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Campaign Creation Schema
export const campaignSchema = z.object({
  name: z.string().min(1).max(200),
  senderName: z.string().min(1).optional().nullable(),
  senderRole: z.string().min(1).optional().nullable(),
  companyName: z.string().min(1).optional().nullable(),
  productName: z.string().min(1),
  productDescription: z.string().min(1).optional().nullable(),
  targetPainPoints: z.string().min(1).optional().nullable(),
  targetCountry: z.string().length(2).default('ZW'),
  locations: z.array(z.string()).default(['Harare']),
  industries: z.array(z.string()).default(['Business']),
  outreachTone: z.enum(['PROFESSIONAL', 'DIRECT', 'FRIENDLY', 'EDUCATIONAL']).default('PROFESSIONAL'),
  ctaLink: z.string().url().or(z.literal('')).optional().nullable(),
  discordWebhook: z.string().url().or(z.literal('')).optional().nullable(),
});
export const updateCampaignSchema = campaignSchema.partial();

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

export const settingsSchema = z.object({
  // Profile (Business Identity)
  companyName: z.string().min(1),
  website: z.string().url().or(z.literal('')).optional().nullable(),
  industry: z.string().optional().nullable(),
  defaultSenderName: z.string().min(1),
  defaultSenderRole: z.string().min(1),
  
  // Default Campaign (Targeting Intelligence) - Optional in global settings
  productName: z.string().min(1).optional(),
  productDescription: z.string().min(1).optional(),
  targetPainPoints: z.string().min(1).optional(),
  targetCountry: z.string().length(2).default('ZW'),
  locations: z.array(z.string()).default(['Harare']),
  industries: z.array(z.string()).default(['Business']),
  discordWebhook: z.string().url().or(z.literal('')).optional().nullable(),
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
