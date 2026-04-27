import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.queryHistory.deleteMany().then(r => console.log('Cleared', r.count)).finally(() => prisma.$disconnect());
