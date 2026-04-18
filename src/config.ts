import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const configSchema = z.object({
    GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
    DISCORD_WEBHOOK: z.string().url('DISCORD_WEBHOOK must be a valid URL'),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    LOG_LEVEL: z.enum(['info', 'debug', 'error', 'warn']).default('info'),
    CRON_SCHEDULE: z.string().default('0 */6 * * *'), // Every 6 hours
    ROTATION_PERIOD_DAYS: z.number().default(7), // 1 week rotation
    
    // Stripe Config
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    
    // Paynow Config
    PAYNOW_INTEGRATION_ID: z.string().optional(),
    PAYNOW_INTEGRATION_KEY: z.string().optional(),
    
    // Supabase Config
    SUPABASE_URL: z.string().url('SUPABASE_URL is required'),
    SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
    SUPABASE_JWT_SECRET: z.string().min(1, 'SUPABASE_JWT_SECRET is required'),
    
    // Scaling & Engine Config
    SERPER_API_KEY: z.string().min(1, 'SERPER_API_KEY is required'),
    ENGINE_TRIGGER_SECRET: z.string().min(1, 'ENGINE_TRIGGER_SECRET is required'),
    MAX_CAMPAIGNS_PER_SWEEP: z.string().transform(v => parseInt(v, 10)).default('50'),

    // UI Config
    FRONTEND_URL: z.string().url().default('http://localhost:3001'),
});

const parsedConfig = configSchema.safeParse(process.env);

if (!parsedConfig.success) {
    console.error('\n' + '='.repeat(50));
    console.error('❌ PLATFORM SETUP REQUIRED');
    console.error('='.repeat(50));
    console.error('Your .env file is missing or contains invalid values.');
    console.error('\n1. Copy .env.example to .env');
    console.error('2. Fill in your API keys and credentials.');
    console.error('3. Restart the application.');
    console.error('='.repeat(50) + '\n');
    
    // In a SaaS context, we must exit if core config is missing
    process.exit(1);
}

export const config = parsedConfig.data;
