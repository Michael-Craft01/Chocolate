const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:e7QT35zcp3gXVXmW@db.yhmpsdonjnaddjfvrbzf.supabase.co:5432/postgres'
    }
  }
});
prisma.campaign.findMany().then(c => console.log('5432 OK, found', c.length)).catch(console.error).finally(() => prisma.$disconnect());
