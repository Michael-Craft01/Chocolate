import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import prisma from './src/lib/prisma.js';
import { config } from './src/config.js';

async function diagnose() {
    console.log('🔍 Starting Diagnostics...');
    console.log('Config SUPABASE_URL:', config.SUPABASE_URL);
    
    const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
    
    console.log('Testing Supabase connection...');
    try {
        // Try a simple operation that doesn't need auth but hits the API
        const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
        if (error) {
            console.error('❌ Supabase API error:', error.message);
        } else {
            console.log('✅ Supabase API reached!');
        }
    } catch (err: any) {
        console.error('❌ Supabase fetch failed:', err.message);
    }

    console.log('Testing Prisma connection...');
    try {
        await prisma.$connect();
        console.log('✅ Prisma connected to DB!');
        const userCount = await prisma.user.count();
        console.log('📊 User count in DB:', userCount);
    } catch (err: any) {
        console.error('❌ Prisma connection failed:', err.message);
    }

    process.exit(0);
}

diagnose();
