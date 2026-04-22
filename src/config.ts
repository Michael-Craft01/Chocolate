import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootPath = path.resolve(__dirname, '../');
const envPath = path.join(rootPath, '.env');

console.log(`\n🔍 [CONFIG] Searching for .env at: ${envPath}`);

if (fs.existsSync(envPath)) {
    console.log(`✅ [CONFIG] .env file found! Reading...`);
    const result = dotenv.config({ path: envPath });
    if (result.error) {
        console.error(`❌ [CONFIG] Error loading .env:`, result.error);
    } else {
        const keys = Object.keys(result.parsed || {});
        console.log(`📊 [CONFIG] Loaded ${keys.length} keys: ${keys.join(', ')}`);
    }
} else {
    console.warn(`⚠️ [CONFIG] .env file NOT FOUND at ${envPath}. Using fallbacks.`);
}

const configSchema = z.object({
    GEMINI_API_KEY: z.string().optional().default(''),
    DISCORD_WEBHOOK: z.string().url().optional().default('https://example.com/webhook-placeholder'),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    LOG_LEVEL: z.enum(['info', 'debug', 'error', 'warn']).default('info'),
    CRON_SCHEDULE: z.string().default('0 */6 * * *'),
    ROTATION_PERIOD_DAYS: z.number().default(7),
    
    // Stripe Config
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    
    // Paynow Config
    PAYNOW_INTEGRATION_ID: z.string().optional(),
    PAYNOW_INTEGRATION_KEY: z.string().optional(),
    
    // Supabase Config
    SUPABASE_URL: z.string().url().optional().default('http://localhost:54321'),
    SUPABASE_ANON_KEY: z.string().optional().default('placeholder-anon-key'),
    SUPABASE_JWT_SECRET: z.string().optional().default('placeholder-jwt-secret'),
    
    // Scaling & Engine Config
    SERPER_API_KEY: z.string().optional().default(''),
    ENGINE_TRIGGER_SECRET: z.string().optional().default('dev-engine-trigger'),
    MAX_CAMPAIGNS_PER_SWEEP: z.string().transform(v => parseInt(v, 10)).default('50'),

    // UI & API Config
    FRONTEND_URL: z.string().url().default('http://localhost:3000'),
    BACKEND_URL: z.string().url().default('http://localhost:3005'),
});

const parsedConfig = configSchema.safeParse(process.env);

export const config = parsedConfig.success ? parsedConfig.data : {
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
    FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    BACKEND_URL: process.env.BACKEND_URL ?? 'http://localhost:3005',
};
