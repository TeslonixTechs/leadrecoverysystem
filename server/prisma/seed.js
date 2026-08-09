const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting ServiceFlow Database Seed...');

  // Clean existing demo data
  await prisma.serviceRequest.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.blockedTime.deleteMany({});
  await prisma.businessHours.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.business.deleteMany({});

  // 1. Create Business: Summit Ridge Roofing
  const business = await prisma.business.create({
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
      arrivalWindowType: 'ESTIMATED_WINDOW'
    }
  });

  console.log(`✅ Business created: ${business.name} (ID: ${business.id})`);

  // 2. Create Business User (Admin)
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'admin@summitridge.com',
      passwordHash,
      role: 'ADMIN',
      businessId: business.id
    }
  });

  console.log(`✅ Business admin user created: admin@summitridge.com / password123`);

  // 3. Create Services
  const servicesData = [
    {
      name: 'Roof Repair',
      description: 'Diagnosis and repair of active leaks, damaged shingles, flashing issues, or pipe boots.',
      durationMinutes: 120,
      isActive: true
    },
    {
      name: 'Roof Inspection',
      description: 'Comprehensive multi-point roofing structural and wear inspection with digital report.',
      durationMinutes: 60,
      isActive: true
    },
    {
      name: 'Storm Damage Inspection',
      description: 'Post-storm wind and hail impact evaluation, emergency tarping assessment, and documentation.',
      durationMinutes: 90,
      isActive: true
    },
    {
      name: 'Roof Replacement Consultation',
      description: 'Full roof replacement estimate, material sampling, ventilation analysis, and quote.',
      durationMinutes: 60,
      isActive: true
    },
    {
      name: 'Gutter Service',
      description: 'Gutter cleaning, seamless gutter repair, leak sealing, and downspout realignment.',
      durationMinutes: 90,
      isActive: true
    }
  ];

  const createdServices = {};
  for (const s of servicesData) {
    const created = await prisma.service.create({
      data: {
        businessId: business.id,
        ...s
      }
    });
    createdServices[s.name] = created;
  }

  console.log(`✅ Created ${Object.keys(createdServices).length} configured services.`);

  // 4. Create Business Hours
  // Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 2:00 PM, Sun: Closed
  const hoursData = [
    { dayOfWeek: 0, isOpen: false, openTime: '09:00', closeTime: '17:00' }, // Sun
    { dayOfWeek: 1, isOpen: true, openTime: '08:00', closeTime: '18:00' },  // Mon
    { dayOfWeek: 2, isOpen: true, openTime: '08:00', closeTime: '18:00' },  // Tue
    { dayOfWeek: 3, isOpen: true, openTime: '08:00', closeTime: '18:00' },  // Wed
    { dayOfWeek: 4, isOpen: true, openTime: '08:00', closeTime: '18:00' },  // Thu
    { dayOfWeek: 5, isOpen: true, openTime: '08:00', closeTime: '18:00' },  // Fri
    { dayOfWeek: 6, isOpen: true, openTime: '09:00', closeTime: '14:00' }   // Sat
  ];

  for (const h of hoursData) {
    await prisma.businessHours.create({
      data: {
        businessId: business.id,
        ...h
      }
    });
  }

  console.log(`✅ Business hours created (Mon-Fri 8am-6pm, Sat 9am-2pm).`);

  // 5. Create Blocked Times for today
  const todayStr = new Date().toISOString().split('T')[0];

  await prisma.blockedTime.create({
    data: {
      businessId: business.id,
      title: 'Lunch Break / Crew Re-tooling',
      date: todayStr,
      startTime: '12:00',
      endTime: '13:00',
      isRecurring: true
    }
  });

  console.log(`✅ Blocked period created: Lunch (12:00 PM - 1:00 PM) for ${todayStr}`);

  // 6. Create Sample Customers
  const customer1 = await prisma.customer.create({
    data: {
      businessId: business.id,
      name: 'Robert Davis',
      phone: '(214) 555-4011',
      email: 'robert.davis@example.com',
      address: '4210 Oak Lawn Ave',
      city: 'Dallas',
      zipCode: '75219'
    }
  });

  const customer2 = await prisma.customer.create({
    data: {
      businessId: business.id,
      name: 'Sarah Miller',
      phone: '(214) 555-8822',
      email: 'sarah.m@example.com',
      address: '7815 Preston Rd',
      city: 'Dallas',
      zipCode: '75230'
    }
  });

  const customer3 = await prisma.customer.create({
    data: {
      businessId: business.id,
      name: 'Michael Brown',
      phone: '(214) 555-9933',
      email: 'mbrown@example.com',
      address: '3104 Greenville Ave',
      city: 'Dallas',
      zipCode: '75206'
    }
  });

  console.log(`✅ Sample customers created.`);

  // 7. Create Sample Appointments for today
  // Appt 1: 08:00 - 10:00 (Roof Repair)
  // Appt 2: 10:30 - 12:00 (Roof Inspection)
  // [12:00 - 13:00 Lunch Blocked]
  // Appt 3: 13:00 - 15:30 (Storm Damage Inspection)
  // Required 30-min travel buffer after Appt 3 ends at 15:30 -> Next start = 16:00 (4:00 PM)!
  const appt1 = await prisma.appointment.create({
    data: {
      businessId: business.id,
      customerId: customer1.id,
      serviceId: createdServices['Roof Repair'].id,
      referenceNumber: 'SR-100101',
      date: todayStr,
      startTime: '08:00',
      endTime: '10:00',
      estimatedArrival: '8:00 AM',
      durationMinutes: 120,
      status: 'COMPLETED',
      notes: 'Repaired flashing around chimney.'
    }
  });

  await prisma.serviceRequest.create({
    data: {
      businessId: business.id,
      customerId: customer1.id,
      serviceId: createdServices['Roof Repair'].id,
      appointmentId: appt1.id,
      problemDescription: 'Leaking flashing near chimney during rain.',
      urgency: 'URGENT',
      status: 'COMPLETED'
    }
  });

  const appt2 = await prisma.appointment.create({
    data: {
      businessId: business.id,
      customerId: customer2.id,
      serviceId: createdServices['Roof Inspection'].id,
      referenceNumber: 'SR-100102',
      date: todayStr,
      startTime: '10:30',
      endTime: '11:30',
      estimatedArrival: '10:30 AM',
      durationMinutes: 60,
      status: 'COMPLETED',
      notes: 'Completed multi-point roof evaluation.'
    }
  });

  await prisma.serviceRequest.create({
    data: {
      businessId: business.id,
      customerId: customer2.id,
      serviceId: createdServices['Roof Inspection'].id,
      appointmentId: appt2.id,
      problemDescription: 'Annual roof condition health check.',
      urgency: 'ROUTINE',
      status: 'COMPLETED'
    }
  });

  const appt3 = await prisma.appointment.create({
    data: {
      businessId: business.id,
      customerId: customer3.id,
      serviceId: createdServices['Storm Damage Inspection'].id,
      referenceNumber: 'SR-100103',
      date: todayStr,
      startTime: '13:00',
      endTime: '15:30',
      estimatedArrival: '1:00 PM',
      durationMinutes: 150,
      status: 'IN_PROGRESS',
      notes: 'Hail damage inspection on south ridge.'
    }
  });

  await prisma.serviceRequest.create({
    data: {
      businessId: business.id,
      customerId: customer3.id,
      serviceId: createdServices['Storm Damage Inspection'].id,
      appointmentId: appt3.id,
      problemDescription: 'Hail impact reported after yesterday night storm.',
      urgency: 'EMERGENCY',
      status: 'SCHEDULED'
    }
  });

  console.log(`✅ Seeded today's schedule (${todayStr}):`);
  console.log(`   - 08:00 AM - 10:00 AM (Roof Repair - Completed)`);
  console.log(`   - 10:30 AM - 11:30 AM (Roof Inspection - Completed)`);
  console.log(`   - 12:00 PM - 01:00 PM (Lunch Blocked)`);
  console.log(`   - 01:00 PM - 03:30 PM (Storm Damage - In Progress)`);
  console.log(`   => Next Available Slot for a 2-hour job at 2:10 PM is 4:00 PM today!\n`);

  console.log('✨ Seed finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
