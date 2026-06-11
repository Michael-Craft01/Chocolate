import { PrismaClient, LeadStatus } from '@prisma/client';

async function runLeadReviewTest() {
  console.log('--- RUNNING LEADS STATE TEST & REVIEW ---');
  const prisma = new PrismaClient();
  
  try {
    // 1. Group leads by status to see the current state distribution
    const statusCounts = await prisma.lead.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });
    
    console.log('\n📊 CURRENT LEAD STATUS DISTRIBUTION:');
    console.table(statusCounts.map(item => ({
      Status: item.status,
      Count: item._count.id,
    })));

    // 2. Fetch a few sample leads with different statuses to inspect their contact channels and structure
    const sampleLeads = await prisma.lead.findMany({
      take: 5,
      include: {
        business: true,
        campaign: true,
      },
    });

    console.log('\n🔍 SAMPLE LEADS FIELD REVIEW:');
    for (const lead of sampleLeads) {
      console.log(`- Lead ID: ${lead.id}`);
      console.log(`  Company: ${lead.business.name}`);
      console.log(`  Campaign: ${lead.campaign.name}`);
      console.log(`  Status: ${lead.status}`);
      console.log(`  Phone: ${lead.business.phone || 'None'}`);
      console.log(`  Email: ${lead.business.email || 'None'}`);
      console.log(`  Best Contact Channel: ${lead.business.bestContactChannel || 'None'}`);
      console.log(`  Contact Quality Status: ${lead.business.contactStatus || 'None'}`);
      
      // Test the status resolution logic used in the dispatch handler
      const emailSent = false; // Mocking direct Resend success
      const markContactedFlag = false; // Mocking UI Confirm Contacted
      
      let whatsappUrl = null;
      let mailtoUrl = null;
      let contactUrl = null;

      if (lead.business.phone) {
        const cleanPhone = lead.business.phone.replace(/\D/g, '');
        if (cleanPhone.length >= 7) {
          whatsappUrl = `https://wa.me/${cleanPhone}`;
        }
      }

      if (lead.business.email) {
        mailtoUrl = `mailto:${lead.business.email}`;
      }

      const contactPages = Array.isArray(lead.business.contactPages) ? (lead.business.contactPages as string[]).filter(Boolean) : [];
      const socialProfiles = Array.isArray(lead.business.socialProfiles) ? (lead.business.socialProfiles as string[]).filter(Boolean) : [];
      contactUrl = contactPages[0] || socialProfiles[0] || null;

      const hasDirectDispatch = emailSent || markContactedFlag;
      const hasOpenedRoute = Boolean(whatsappUrl || mailtoUrl || contactUrl);
      const computedStatus = hasDirectDispatch ? LeadStatus.CONTACTED : hasOpenedRoute ? LeadStatus.CONTACT_ROUTE_OPENED : lead.status;

      console.log(`  Computed State (Dispatch): ${computedStatus}`);
      console.log('--------------------------------------------');
    }
  } catch (error) {
    console.error('❌ Error executing leads review test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runLeadReviewTest();
