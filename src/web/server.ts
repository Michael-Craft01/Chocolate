import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
// Views are located in project_root/views
app.set('views', path.join(__dirname, '../../views'));

// Serve static files from src/web/public
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => {
    try {
        const totalBusinesses = await prisma.business.count();
        const totalLeads = await prisma.lead.count();

        const startOfToday = new Date();
        startOfToday.setHours(0,0,0,0);
        const leadsToday = await prisma.lead.count({
            where: { createdAt: { gte: startOfToday } }
        });

        const recentLeads = await prisma.lead.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { business: true }
        });

        res.render('dashboard', {
            title: 'Dashboard',
            stats: { totalBusinesses, totalLeads, leadsToday },
            recentLeads
        });
    } catch (error) {
        logger.error({ err: error }, 'Error loading dashboard');
        res.status(500).send('Internal Server Error');
    }
});

app.get('/leads', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;

        const leads = await prisma.lead.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: { business: true }
        });

        const totalLeads = await prisma.lead.count();
        const totalPages = Math.ceil(totalLeads / limit);

        res.render('leads', {
            title: 'Leads',
            leads,
            pagination: { page, totalPages }
        });
    } catch (error) {
        logger.error({ err: error }, 'Error loading leads');
        res.status(500).send('Internal Server Error');
    }
});

export const startServer = () => {
    app.listen(PORT, () => {
        logger.info(`Web server started on port ${PORT}`);
    });
};
