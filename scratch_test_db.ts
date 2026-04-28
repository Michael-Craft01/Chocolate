import { PrismaClient } from '@prisma/client';

async function testConnection() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  try {
    console.log('Attempting to connect to database...');
    await prisma.$connect();
    console.log('✅ Connection successful!');
    const count = await prisma.campaign.count();
    console.log(`Successfully queried campaigns. Count: ${count}`);
  } catch (error) {
    console.error('❌ Connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
