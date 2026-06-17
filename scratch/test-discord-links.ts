import { discordDispatcher } from '../src/services/discordDispatcher.js';
import axios from 'axios';

async function testDiscordLinks() {
    console.log('🏁 [TEST START] Verifying Discord button link pre-filling and truncation...');

    let interceptedPayload: any = null;
    
    // Intercept axios.post to audit the payload sent to Discord
    axios.post = async (url: string, data: any) => {
        interceptedPayload = data;
        return { status: 200, data: {} } as any;
    };

    const webhookUrl = 'https://discord.com/api/webhooks/mock-webhook-url';

    // ==========================================
    // CASE 1: Short message (No truncation)
    // ==========================================
    console.log('\n--- Case 1: Short outreach message ---');
    const shortMessage = 'Hi John, I love your bakery in New York. Let\'s chat!';
    const leadShort = {
        name: 'John\'s Bakery',
        location: 'New York, US',
        industry: 'Bakery',
        painPoint: 'Customer acquisition',
        message: shortMessage,
        phone: '+1 (555) 019-9232 ext 12',
        email: 'john@example.com',
        website: 'https://johnsbakery.com',
        companyName: 'BakeCorp'
    };

    await discordDispatcher.dispatch(leadShort, 'warm', webhookUrl);

    if (interceptedPayload) {
        const components = interceptedPayload.components?.[0]?.components || [];
        console.log(`Found ${components.length} buttons.`);
        
        const waButton = components.find((c: any) => c.label === 'WhatsApp');
        const emailButton = components.find((c: any) => c.label === 'Email');
        const callButton = components.find((c: any) => c.label === 'Call Lead');

        console.log('WhatsApp Button URL:', waButton?.url);
        console.log('Email Button URL:', emailButton?.url);
        console.log('Call Button URL:', callButton?.url);

        // Verification checks
        if (waButton && waButton.url.includes(encodeURIComponent(shortMessage)) && waButton.url.length < 512) {
            console.log('✅ Success: WhatsApp pre-filled URL is valid.');
        } else {
            console.error('❌ Failure: WhatsApp URL is incorrect or exceeds limit.');
        }

        if (emailButton && emailButton.url.includes(encodeURIComponent(shortMessage)) && emailButton.url.includes(encodeURIComponent('Outreach from BakeCorp')) && emailButton.url.length < 512) {
            console.log('✅ Success: Email pre-filled URL is valid with Company Subject.');
        } else {
            console.error('❌ Failure: Email URL is incorrect or exceeds limit. URL:', emailButton?.url);
        }

        if (callButton && callButton.url === 'tel:+1555019923212') {
            console.log('✅ Success: Direct Call URL is valid and properly scrubbed of extra text.');
        } else {
            console.error(`❌ Failure: Call URL is incorrect (got ${callButton?.url}).`);
        }
    } else {
        console.error('❌ Failure: No payload intercepted.');
    }

    // ==========================================
    // CASE 2: Very long message (Needs truncation)
    // ==========================================
    console.log('\n--- Case 2: Very long outreach message (1000 characters) ---');
    const longMessage = 'A'.repeat(1000);
    const leadLong = {
        name: 'John\'s Giant Bakery',
        location: 'New York, US',
        industry: 'Bakery',
        painPoint: 'Customer acquisition',
        message: longMessage,
        phone: '+1 555-0199',
        email: 'john@example.com',
        website: 'https://johnsbakery.com',
        companyName: 'BakeCorp'
    };

    await discordDispatcher.dispatch(leadLong, 'warm', webhookUrl);

    if (interceptedPayload) {
        const components = interceptedPayload.components?.[0]?.components || [];
        console.log(`Found ${components.length} buttons.`);
        
        const waButton = components.find((c: any) => c.label === 'WhatsApp');
        const emailButton = components.find((c: any) => c.label === 'Email');

        console.log(`WhatsApp Button URL Length: ${waButton?.url.length} chars`);
        console.log(`Email Button URL Length: ${emailButton?.url.length} chars`);

        if (waButton && waButton.url.length <= 512) {
            console.log(`✅ Success: WhatsApp URL is within limits. (Url ends with: ... : ${waButton.url.endsWith(encodeURIComponent('...'))})`);
        } else {
            console.error(`❌ Failure: WhatsApp URL exceeds limit! Length: ${waButton?.url.length}`);
        }

        if (emailButton && emailButton.url.length <= 512) {
            console.log(`✅ Success: Email URL is within limits. (Url ends with: ... : ${emailButton.url.endsWith(encodeURIComponent('...'))})`);
        } else {
            console.error(`❌ Failure: Email URL exceeds limit! Length: ${emailButton?.url.length}`);
        }
    } else {
        console.error('❌ Failure: No payload intercepted.');
    }

    console.log('\n🏁 [TEST END] Discord button validation complete.');
}

testDiscordLinks().catch(console.error);
