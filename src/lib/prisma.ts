import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';

let prisma: PrismaClient;

if (!process.env.DATABASE_URL) {
    logger.error('❌ DATABASE_URL is missing! Database operations will fail.');
    // We instantiate with a dummy URL to avoid the constructor validation error,
    // though actual queries will still fail until the .env is fixed.
    prisma = new PrismaClient({
        datasources: {
            db: {
                url: 'postgresql://placeholder:placeholder@localhost:5432/placeholder'
            }
        }
    });
} else {
    prisma = new PrismaClient({
        log: process.env.LOG_LEVEL === 'debug' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
}

export default prisma;
