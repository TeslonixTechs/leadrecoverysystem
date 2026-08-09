const test = require('node:test');
const assert = require('node:assert/strict');
const prisma = require('../src/config/prisma');
const { findEarliestAvailableSlot, timeToMinutes, minutesToTime, format12Hour } = require('../src/services/schedulingService');
const { classifyProblem } = require('../src/services/serviceClassificationService');

test('Time conversion helpers', () => {
  assert.equal(timeToMinutes('08:00'), 480);
  assert.equal(timeToMinutes('14:10'), 850);
  assert.equal(timeToMinutes('16:00'), 960);

  assert.equal(minutesToTime(480), '08:00');
  assert.equal(minutesToTime(960), '16:00');

  assert.equal(format12Hour('08:00'), '8:00 AM');
  assert.equal(format12Hour('12:00'), '12:00 PM');
  assert.equal(format12Hour('16:00'), '4:00 PM');
});

test('Service Classification Engine', async () => {
  const mockServices = [
    { id: '1', name: 'Roof Repair', durationMinutes: 120 },
    { id: '2', name: 'Roof Inspection', durationMinutes: 60 },
    { id: '3', name: 'Storm Damage Inspection', durationMinutes: 90 },
    { id: '4', name: 'Gutter Service', durationMinutes: 90 }
  ];

  // Case 1: Leak / ceiling water
  const res1 = await classifyProblem('Water is coming through my bedroom ceiling after the storm.', mockServices);
  assert.ok(res1.suggestedServiceId);
  assert.equal(res1.suggestedServiceName, 'Storm Damage Inspection');

  // Case 2: Direct leak
  const res2 = await classifyProblem('I have a small leak in the kitchen ceiling.', mockServices);
  assert.equal(res2.suggestedServiceName, 'Roof Repair');

  // Case 3: Gutter
  const res3 = await classifyProblem('My gutters are overflowed and clogged with leaves.', mockServices);
  assert.equal(res3.suggestedServiceName, 'Gutter Service');
});

test('Scheduling Engine - Demo Scenario (2:10 PM request -> 4:00 PM arrival)', async () => {
  // Ensure database has seeded business
  const business = await prisma.business.findFirst({ where: { slug: 'summit-ridge' } });
  if (!business) {
    console.log('Skipping database test: Seed data not present yet.');
    return;
  }

  const repairService = await prisma.service.findFirst({
    where: { businessId: business.id, name: 'Roof Repair' }
  });
  assert.ok(repairService, 'Roof Repair service should exist');

  // Use Monday date when business is open (Mon-Fri 8:00 AM - 6:00 PM)
  const targetDate = '2026-08-10';

  // Seed test appointments for targetDate (2026-08-10):
  // Appt 1: 08:00 - 10:00 (Roof Repair)
  // Appt 2: 10:30 - 11:30 (Roof Inspection)
  // [12:00 - 13:00 Lunch Blocked]
  // Appt 3: 13:00 - 15:30 (Storm Damage Inspection)
  // Required 30-min travel buffer after Appt 3 ends at 15:30 -> Next start = 16:00 (4:00 PM)!
  const customer = await prisma.customer.findFirst({ where: { businessId: business.id } });

  await prisma.appointment.deleteMany({ where: { businessId: business.id, date: targetDate } });
  await prisma.blockedTime.deleteMany({ where: { businessId: business.id, date: targetDate } });

  await prisma.blockedTime.create({
    data: { businessId: business.id, title: 'Lunch', date: targetDate, startTime: '12:00', endTime: '13:00' }
  });

  await prisma.appointment.create({
    data: { businessId: business.id, customerId: customer.id, serviceId: repairService.id, referenceNumber: 'TEST-1', date: targetDate, startTime: '08:00', endTime: '10:00', estimatedArrival: '8:00 AM', durationMinutes: 120, status: 'COMPLETED' }
  });
  await prisma.appointment.create({
    data: { businessId: business.id, customerId: customer.id, serviceId: repairService.id, referenceNumber: 'TEST-2', date: targetDate, startTime: '10:30', endTime: '11:30', estimatedArrival: '10:30 AM', durationMinutes: 60, status: 'COMPLETED' }
  });
  await prisma.appointment.create({
    data: { businessId: business.id, customerId: customer.id, serviceId: repairService.id, referenceNumber: 'TEST-3', date: targetDate, startTime: '13:00', endTime: '15:30', estimatedArrival: '1:00 PM', durationMinutes: 150, status: 'IN_PROGRESS' }
  });

  // Run availability search with simulated current time 2:10 PM ("14:10")
  const slot = await findEarliestAvailableSlot({
    businessId: business.id,
    serviceId: repairService.id,
    requestedDate: targetDate,
    currentTimeOverride: '14:10'
  });

  assert.equal(slot.available, true);
  assert.equal(slot.date, targetDate);
  assert.equal(slot.startTime, '16:00');
  assert.equal(slot.endTime, '18:00');
  assert.equal(slot.estimatedArrival, '4:00 PM');
});
