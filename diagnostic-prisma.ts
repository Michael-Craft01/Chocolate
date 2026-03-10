import { logger } from './src/lib/logger.js';
import prisma from './src/lib/prisma.js';

async function test() {
    try {
        logger.info('Diagnostic: Attempting database connection...');
        const count = await prisma.business.count();
        logger.info(`Diagnostic: Success! Business count: ${count}`);
        process.exit(0);
    } catch (err) {
        console.error('--- FULL ERROR START ---');
        console.error(err);
        console.error('--- FULL ERROR END ---');
        process.exit(1);
    }
}

test();
