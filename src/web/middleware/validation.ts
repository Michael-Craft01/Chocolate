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

// Validation Middleware
export const validate = (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: error.errors.map(e => ({ path: e.path, message: e.message }))
      });
    }
    next(error);
  }
};
