import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const user = await prisma.user.findUnique({
    where: { id: 'b1bbc92a-33c9-4543-ba2b-1c048f9b33d' },
});

// Also find by email in case id differs
const allUsers = await prisma.user.findMany({
    select: { id: true, email: true, tier: true, dailyLimit: true, leadsFoundToday: true, paymentStatus: true, creditBalance: true }
});

console.log('--- ALL USERS ---');
console.table(allUsers);
await prisma.$disconnect();
