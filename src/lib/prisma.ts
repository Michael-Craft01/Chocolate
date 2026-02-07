import 'dotenv/config'; // Ensure env is loaded
import { PrismaClient } from '@prisma/client';

console.log('DEBUG: PrismaClient type:', typeof PrismaClient);
console.log('DEBUG: PrismaClient value:', PrismaClient);

if (!process.env.DATABASE_URL) {
    console.warn('⚠️ DATABASE_URL is missing in prisma.ts! Prisma Client might fail.');
}

// Prisma 7: Standard client initialization for PostgreSQL
const prisma = new PrismaClient({
    log: process.env.LOG_LEVEL === 'debug' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

export default prisma;
