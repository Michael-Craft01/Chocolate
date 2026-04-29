import { dispatchService } from '../src/services/dispatchService.js';

async function test() {
    console.log('Testing Resend Cycle Summary Email...');
    await dispatchService.sendUserCycleSummary(
        'b1bbc92a-33c9-4543-ba2b-1c048f90b33d', 
        [{ campaignName: 'Neural Sweep Alpha', count: 12 }]
    );
    console.log('✅ If no error appeared above, check your inbox (ragumichael88@gmail.com)');
}

test().catch(console.error);
