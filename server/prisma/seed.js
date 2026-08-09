const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting ServiceFlow production setup...');

  // --------------------------------------------------
  // 1. BUSINESS
  // --------------------------------------------------

  let business = await prisma.business.findUnique({
    where: {
      slug: 'summit-ridge',
    },
  });

  if (!business) {
    business = await prisma.business.create({
      data: {
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

    console.log(`✅ Business created: ${business.name}`);
  } else {
    console.log(`ℹ️ Business already exists: ${business.name}`);
  }

  // --------------------------------------------------
  // 2. ADMIN USER
  // --------------------------------------------------

  const existingUser = await prisma.user.findUnique({
    where: {
      email: 'admin@summitridge.com',
    },
  });

  if (!existingUser) {
    const passwordHash = await bcrypt.hash('password123', 10);

    await prisma.user.create({
      data: {
        email: 'admin@summitridge.com',
        passwordHash,
        role: 'ADMIN',
        businessId: business.id,
      },
    });

    console.log('✅ Admin account created');
  } else {
    console.log('ℹ️ Admin account already exists');
  }

  // --------------------------------------------------
  // 3. SERVICES
  // --------------------------------------------------

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
    const existingService = await prisma.service.findFirst({
      where: {
        businessId: business.id,
        name: service.name,
      },
    });

    if (!existingService) {
      await prisma.service.create({
        data: {
          businessId: business.id,
          ...service,
          isActive: true,
        },
      });

      console.log(`✅ Service created: ${service.name}`);
    }
  }

  // --------------------------------------------------
  // 4. BUSINESS HOURS
  // --------------------------------------------------
  // 8:00 AM - 5:00 PM
  // Every day
  //
  // 0 = Sunday
  // 1 = Monday
  // 2 = Tuesday
  // 3 = Wednesday
  // 4 = Thursday
  // 5 = Friday
  // 6 = Saturday

  const hours = [
    { dayOfWeek: 0 },
    { dayOfWeek: 1 },
    { dayOfWeek: 2 },
    { dayOfWeek: 3 },
    { dayOfWeek: 4 },
    { dayOfWeek: 5 },
    { dayOfWeek: 6 },
  ];

  for (const day of hours) {
    const existingHours = await prisma.businessHours.findUnique({
      where: {
        businessId_dayOfWeek: {
          businessId: business.id,
          dayOfWeek: day.dayOfWeek,
        },
      },
    });

    if (!existingHours) {
      await prisma.businessHours.create({
        data: {
          businessId: business.id,
          dayOfWeek: day.dayOfWeek,
          isOpen: true,
          openTime: '08:00',
          closeTime: '17:00',
        },
      });
    } else {
      await prisma.businessHours.update({
        where: {
          id: existingHours.id,
        },
        data: {
          isOpen: true,
          openTime: '08:00',
          closeTime: '17:00',
        },
      });
    }
  }

  console.log('✅ Business hours configured: 8:00 AM - 5:00 PM');

  // --------------------------------------------------
  // IMPORTANT:
  // NO DEMO CUSTOMERS
  // NO DEMO APPOINTMENTS
  // NO DEMO SERVICE REQUESTS
  // NO DEMO BLOCKED TIMES
  // --------------------------------------------------

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Production setup complete');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Business: ${business.name}`);
  console.log('Hours: 8:00 AM - 5:00 PM');
  console.log('Demo customers: NONE');
  console.log('Demo appointments: NONE');
  console.log('Demo requests: NONE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((error) => {
    console.error('❌ Seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });