import { PrismaClient } from '../../generated/prisma/index.js';
import { config } from '../config.js';

// Ensure the environment variable is set for the client
process.env.DATABASE_URL = config.DATABASE_URL;

const prisma = new PrismaClient();

export default prisma;
