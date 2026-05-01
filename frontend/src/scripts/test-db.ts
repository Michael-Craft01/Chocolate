import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function test() {
    console.log('Testing Frontend Prisma with .env.local...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    
    const prisma = new PrismaClient();
    
    try {
        await prisma.$connect();
        console.log('✅ Connected!');
        const count = await prisma.campaign.count();
        console.log('Campaigns count:', count);
    } catch (err: any) {
        console.error('❌ Failed:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

test();
