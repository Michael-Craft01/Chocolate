import { PrismaClient } from '../generated/prisma';
import { config } from '../config';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: config.DATABASE_URL,
        },
    },
});

export default prisma;
