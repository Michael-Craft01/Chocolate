import prisma from '../src/lib/prisma.js';

async function testSync() {
    const userId = "test-user-id-" + Date.now();
    const email = "test@example.com";

    console.log(`Testing upsert for ${userId}...`);
    try {
        const user = await prisma.user.upsert({
            where: { id: userId },
            update: { email: email },
            create: { id: userId, email: email }
        });
        console.log("✅ Upsert successful:", user);
        
        const found = await prisma.user.findUnique({ where: { id: userId } });
        console.log("✅ FindUnique successful:", found);

        await prisma.user.delete({ where: { id: userId } });
        console.log("✅ Cleanup successful");
    } catch (err: any) {
        console.error("❌ Test failed:", err.message);
        console.error(err.stack);
    }
}

testSync().finally(() => prisma.$disconnect());
