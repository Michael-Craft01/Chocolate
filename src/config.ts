import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const configSchema = z.object({
    GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
    DISCORD_WEBHOOK: z.string().url('DISCORD_WEBHOOK must be a valid URL'),
    DATABASE_URL: z.string().default('file:./data/dev.db'),
    LOG_LEVEL: z.enum(['info', 'debug', 'error', 'warn']).default('info'),
    CRON_SCHEDULE: z.string().default('0 */6 * * *'), // Every 6 hours
    ROTATION_PERIOD_DAYS: z.number().default(7), // 1 week rotation
});

const parsedConfig = configSchema.safeParse(process.env);

if (!parsedConfig.success) {
    console.error('❌ Invalid environment variables:', parsedConfig.error.format());
    process.exit(1);
}

export const config = parsedConfig.data;
