// Test harness for isCycleDue automation logic
import { logger } from '../src/lib/logger.js';

function isCycleDue(
    user: { automationMode: string; autoRunFrequency: string },
    lastCycle?: { createdAt: Date; status: string; leadsFound: number; maxLeads: number } | null
): boolean {
    if (user.automationMode === 'MANUAL' || user.autoRunFrequency === 'MANUAL') return false;

    if (user.automationMode === 'SMART' && lastCycle) {
        const yieldRatio = lastCycle.maxLeads > 0 ? lastCycle.leadsFound / lastCycle.maxLeads : 0;
        if (lastCycle.status === 'FAILED' || yieldRatio < 0.2) return false;
    }

    if (!lastCycle) return true;

    const elapsedMs = Date.now() - lastCycle.createdAt.getTime();
    const requiredMs =
        user.autoRunFrequency === 'DAILY' ? 24 * 60 * 60 * 1000 :
        user.autoRunFrequency === 'EVERY_2_DAYS' ? 2 * 24 * 60 * 60 * 1000 :
        user.autoRunFrequency === 'WEEKLY' ? 7 * 24 * 60 * 60 * 1000 :
        Number.POSITIVE_INFINITY;

    return elapsedMs >= requiredMs;
}

function runTests() {
    console.log('🏁 [TEST START] Verifying Campaign Auto-Run Rules (isCycleDue)...');

    // Test Case 1: Manual Mode (Should never trigger)
    const tc1 = isCycleDue({ automationMode: 'MANUAL', autoRunFrequency: 'DAILY' });
    console.log(`TC1 (Manual Mode): ${tc1 === false ? '✅ PASS' : '❌ FAIL'}`);

    // Test Case 2: Manual Frequency (Should never trigger)
    const tc2 = isCycleDue({ automationMode: 'AUTOMATIC', autoRunFrequency: 'MANUAL' });
    console.log(`TC2 (Manual Frequency): ${tc2 === false ? '✅ PASS' : '❌ FAIL'}`);

    // Test Case 3: Automatic mode, no previous run (Should trigger immediately)
    const tc3 = isCycleDue({ automationMode: 'AUTOMATIC', autoRunFrequency: 'DAILY' }, null);
    console.log(`TC3 (First Run): ${tc3 === true ? '✅ PASS' : '❌ FAIL'}`);

    // Test Case 4: Daily scan, 10 hours elapsed (Should NOT trigger)
    const tenHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000);
    const tc4 = isCycleDue(
        { automationMode: 'AUTOMATIC', autoRunFrequency: 'DAILY' },
        { createdAt: tenHoursAgo, status: 'COMPLETED', leadsFound: 15, maxLeads: 15 }
    );
    console.log(`TC4 (Daily - 10h elapsed): ${tc4 === false ? '✅ PASS' : '❌ FAIL'}`);

    // Test Case 5: Daily scan, 25 hours elapsed (Should trigger)
    const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);
    const tc5 = isCycleDue(
        { automationMode: 'AUTOMATIC', autoRunFrequency: 'DAILY' },
        { createdAt: twentyFiveHoursAgo, status: 'COMPLETED', leadsFound: 15, maxLeads: 15 }
    );
    console.log(`TC5 (Daily - 25h elapsed): ${tc5 === true ? '✅ PASS' : '❌ FAIL'}`);

    // Test Case 6: SMART mode, low yield (<20% leads found) (Should NOT trigger)
    const tc6 = isCycleDue(
        { automationMode: 'SMART', autoRunFrequency: 'DAILY' },
        { createdAt: twentyFiveHoursAgo, status: 'COMPLETED', leadsFound: 2, maxLeads: 15 } // 2/15 = 13% yield
    );
    console.log(`TC6 (Smart Mode - 13% Yield): ${tc6 === false ? '✅ PASS' : '❌ FAIL'}`);

    // Test Case 7: SMART mode, high yield (>=20% leads found) (Should trigger)
    const tc7 = isCycleDue(
        { automationMode: 'SMART', autoRunFrequency: 'DAILY' },
        { createdAt: twentyFiveHoursAgo, status: 'COMPLETED', leadsFound: 10, maxLeads: 15 } // 10/15 = 66% yield
    );
    console.log(`TC7 (Smart Mode - 66% Yield): ${tc7 === true ? '✅ PASS' : '❌ FAIL'}`);

    // Test Case 8: SMART mode, last cycle failed (Should NOT trigger)
    const tc8 = isCycleDue(
        { automationMode: 'SMART', autoRunFrequency: 'DAILY' },
        { createdAt: twentyFiveHoursAgo, status: 'FAILED', leadsFound: 0, maxLeads: 15 }
    );
    console.log(`TC8 (Smart Mode - Failed Last Cycle): ${tc8 === false ? '✅ PASS' : '❌ FAIL'}`);

    console.log('🏁 [TEST END] isCycleDue validation complete.');
}

runTests();
