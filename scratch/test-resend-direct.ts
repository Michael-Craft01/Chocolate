import { Resend } from 'resend';
import { config } from '../src/config.js';

const resend = new Resend(config.RESEND_API_KEY);

async function run() {
    console.log('Sending direct test email via Resend...');
    console.log('API Key:', config.RESEND_API_KEY?.substring(0, 10) + '...');
    console.log('From Email:', config.RESEND_FROM_EMAIL);
    
    try {
        const response = await resend.emails.send({
            from: config.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
            to: 'ragumichael88@gmail.com',
            subject: 'Direct Test Email',
            html: '<p>Direct test email from HyprLead setup!</p>'
        });
        
        console.log('Raw Resend Response:', JSON.stringify(response, null, 2));
    } catch (error: any) {
        console.error('Raw Error caught:', error);
    }
}

run();
