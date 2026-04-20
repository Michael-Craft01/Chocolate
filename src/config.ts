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
    MAX_CAMPAIGNS_PER_SWEEP: z.string().transform(v => parseInt(v, 10)).default(50),

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
}

const fallbackConfig = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? '',
    DISCORD_WEBHOOK: process.env.DISCORD_WEBHOOK ?? 'https://example.com/webhook-placeholder',
    DATABASE_URL: process.env.DATABASE_URL ?? '',
    LOG_LEVEL: (process.env.LOG_LEVEL as 'info' | 'debug' | 'error' | 'warn') ?? 'info',
    CRON_SCHEDULE: process.env.CRON_SCHEDULE ?? '0 */6 * * *',
    ROTATION_PERIOD_DAYS: process.env.ROTATION_PERIOD_DAYS ? parseInt(process.env.ROTATION_PERIOD_DAYS, 10) : 7,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    PAYNOW_INTEGRATION_ID: process.env.PAYNOW_INTEGRATION_ID,
    PAYNOW_INTEGRATION_KEY: process.env.PAYNOW_INTEGRATION_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL ?? 'http://localhost:54321',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ?? 'placeholder-anon-key',
    SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET ?? 'placeholder-jwt-secret',
    SERPER_API_KEY: process.env.SERPER_API_KEY ?? '',
    ENGINE_TRIGGER_SECRET: process.env.ENGINE_TRIGGER_SECRET ?? 'dev-engine-trigger',
    MAX_CAMPAIGNS_PER_SWEEP: process.env.MAX_CAMPAIGNS_PER_SWEEP ? parseInt(process.env.MAX_CAMPAIGNS_PER_SWEEP, 10) : 50,
    FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:3001',
};

const shouldFailOnInvalidConfig = process.env.STRICT_CONFIG_VALIDATION === 'true';
if (!parsedConfig.success && shouldFailOnInvalidConfig) {
    process.exit(1);
}

export const config = parsedConfig.success ? parsedConfig.data : fallbackConfig;
