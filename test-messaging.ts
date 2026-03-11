import { MessageGenerator } from './src/services/messageGenerator.js';

const generator = new MessageGenerator();

const testCases = [
    { name: 'Mutare Spare Parts', industry: 'Auto Parts', painPoint: 'Inventory inaccuracy' },
    { name: 'Harare Gourmet Bakery', industry: 'Bakery', painPoint: 'Manual stock tracking' },
];

console.log('--- TESTING DYNAMIC MESSAGES ---\n');

testCases.forEach(tc => {
    console.log(`Testing for: ${tc.name} (${tc.industry})`);
    const message = generator.generate(tc.name, tc.industry, tc.painPoint);
    console.log(message);
    console.log('\n--- WHATSAPP ---');
    console.log(generator.generateWhatsAppGreeting(tc.name));
    console.log('\n' + '='.repeat(30) + '\n');
});
