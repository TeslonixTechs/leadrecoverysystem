const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Setting up Summit Ridge Roofing...');

  // 1. Business
  const business = await prisma.business.upsert({
    where: {
      slug: 'summit-ridge',
    },
    update: {
      name: 'Summit Ridge Roofing',
      phone: '(214) 555-0199',
      email: 'contact@summitridge.com',
      address: '1400 Main Street, Suite 200',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75201',
      serviceArea: 'Dallas-Fort Worth Metroplex',
      timezone: 'America/Chicago',
      emergencyEnabled: true,
      travelBufferMinutes: 30,
      arrivalWindowType: 'ESTIMATED_WINDOW',
    },
    create: {
      name: 'Summit Ridge Roofing',
      slug: 'summit-ridge',
      phone: '(214) 555-0199',
      email: 'contact@summitridge.com',
      address: '1400 Main Street, Suite 200',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75201',
      serviceArea: 'Dallas-Fort Worth Metroplex',
      timezone: 'America/Chicago',
      ratingScore: 4.9,
      ratingCount: 142,
      emergencyEnabled: true,
      travelBufferMinutes: 30,
      arrivalWindowType: 'ESTIMATED_WINDOW',
    },
  });

  console.log(`✅ Business ready: ${business.name}`);

  // 2. Services
  const services = [
    {
      name: 'Roof Repair',
      description:
        'Diagnosis and repair of active leaks, damaged shingles, flashing issues, or pipe boots.',
      durationMinutes: 120,
    },
    {
      name: 'Roof Inspection',
      description:
        'Comprehensive roofing inspection with condition assessment and digital report.',
      durationMinutes: 60,
    },
    {
      name: 'Storm Damage Inspection',
      description:
        'Wind and hail damage evaluation, emergency assessment, and documentation.',
      durationMinutes: 90,
    },
    {
      name: 'Roof Replacement Consultation',
      description:
        'Roof replacement consultation, material options, ventilation analysis, and estimate.',
      durationMinutes: 60,
    },
    {
      name: 'Gutter Service',
      description:
        'Gutter cleaning, repair, leak sealing, and downspout service.',
      durationMinutes: 90,
    },
  ];

  for (const service of services) {
    const existing = await prisma.service.findFirst({
      where: {
        businessId: business.id,
        name: service.name,
      },
    });

    if (existing) {
      await prisma.service.update({
        where: { id: existing.id },
        data: {
          description: service.description,
          durationMinutes: service.durationMinutes,
          isActive: true,
        },
      });
    } else {
      await prisma.service.create({
        data: {
          businessId: business.id,
          ...service,
          isActive: true,
        },
      });
    }

    console.log(`✅ Service ready: ${service.name}`);
  }

  // 3. Business hours: 8 AM - 5 PM
  for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
    await prisma.businessHours.upsert({
      where: {
        businessId_dayOfWeek: {
          businessId: business.id,
          dayOfWeek,
        },
      },
      update: {
        isOpen: true,
        openTime: '08:00',
        closeTime: '17:00',
      },
      create: {
        businessId: business.id,
        dayOfWeek,
        isOpen: true,
        openTime: '08:00',
        closeTime: '17:00',
      },
    });
  }

  console.log('✅ Business hours: 8:00 AM - 5:00 PM');

  console.log('');
  console.log('🎉 Production business setup complete.');
  console.log('Existing customers/appointments were NOT deleted.');
}

main()
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });