import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function migrate() {
    const oldId = "b1bbc92a-33c9-4543-ba2b-1c048f90b33d";
    const newId = "8402e1ea-d8cc-4c17-a92a-4e2d4c17d696";
    const email = "ragumichael88@gmail.com";

    console.log(`Migrating ${email} from ${oldId} to ${newId}...`);

    try {
        await prisma.$transaction([
            prisma.user.update({
                where: { id: oldId },
                data: { email: `MIGRATING_${Date.now()}_${email}` }
            }),
            prisma.user.create({
                data: { 
                    id: newId, 
                    email: email,
                    tier: 'FREE',
                    paymentStatus: 'free'
                }
            }),
            prisma.campaign.updateMany({
                where: { userId: oldId },
                data: { userId: newId }
            }),
            prisma.transaction.updateMany({
                where: { userId: oldId },
                data: { userId: newId }
            }),
            prisma.profile.updateMany({
                where: { userId: oldId },
                data: { userId: newId }
            }),
            prisma.user.delete({ where: { id: oldId } })
        ]);
        console.log("✅ Migration successful!");
    } catch (err: any) {
        console.error("❌ Migration failed:", err.message);
        console.error(err);
    }
}

migrate().finally(() => prisma.$disconnect());
