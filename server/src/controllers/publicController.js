const prisma = require('../config/prisma');
const { findEarliestAvailableSlot } = require('../services/schedulingService');
const { classifyProblem } = require('../services/serviceClassificationService');
const NotificationService = require('../services/notificationService');

/**
 * Get public business information, services, business hours for customer intake landing page.
 */
async function getPublicBusinessInfo(req, res, next) {
  try {
    const { slug } = req.query;

    let business;
    if (slug) {
      business = await prisma.business.findUnique({
        where: { slug },
        include: {
          services: { where: { isActive: true } },
          businessHours: true
        }
      });
    }

    if (!business) {
      // Default to first business (e.g. Summit Ridge Roofing)
      business = await prisma.business.findFirst({
        include: {
          services: { where: { isActive: true } },
          businessHours: true
        }
      });
    }

    if (!business) {
      return res.status(404).json({ error: 'Business profile not found.' });
    }

    res.json(business);
  } catch (err) {
    next(err);
  }
}

/**
 * Service Classification API endpoint.
 * Analyzes problem description and returns recommended service ID & rationale.
 */
async function classifyService(req, res, next) {
  try {
    const { businessId, problemDescription } = req.body;

    if (!businessId || !problemDescription) {
      return res.status(400).json({ error: 'Business ID and problem description are required.' });
    }

    const services = await prisma.service.findMany({
      where: { businessId, isActive: true }
    });

    const classification = await classifyProblem(problemDescription, services);
    res.json(classification);
  } catch (err) {
    next(err);
  }
}

/**
 * Check Availability API endpoint.
 * Returns calculated available appointment slot(s).
 */
async function checkAvailability(req, res, next) {
  try {
    const { businessId, serviceId, requestedDate, currentTimeOverride } = req.query;

    if (!businessId || !serviceId) {
      return res.status(400).json({ error: 'Business ID and Service ID are required.' });
    }

    const slotResult = await findEarliestAvailableSlot({
      businessId,
      serviceId,
      requestedDate: requestedDate || new Date().toISOString().split('T')[0],
      currentTimeOverride: currentTimeOverride || null
    });

    res.json(slotResult);
  } catch (err) {
    next(err);
  }
}

/**
 * Core Public Booking API endpoint.
 * Executes atomic booking inside a database transaction to prevent double bookings.
 */
async function bookAppointment(req, res, next) {
  try {
    const {
      businessId,
      serviceId,
      name,
      phone,
      email,
      address,
      city,
      zipCode,
      problemDescription,
      urgency,
      photoUrls,
      requestedDate,
      currentTimeOverride
    } = req.body;

    if (!businessId || !serviceId || !name || !phone || !address || !city || !zipCode) {
      return res.status(400).json({ error: 'Please provide all required customer and property fields.' });
    }

    // Process booking inside a database transaction
    const bookingResult = await prisma.$transaction(async (tx) => {
      // 1. Double check business exists
      const business = await tx.business.findUnique({ where: { id: businessId } });
      if (!business) {
        throw new Error('Target business not found.');
      }

      // 2. Check service exists
      const service = await tx.service.findFirst({ where: { id: serviceId, businessId, isActive: true } });
      if (!service) {
        throw new Error('Selected service is not available.');
      }

      // 3. Find earliest available slot dynamically
      const targetDate = requestedDate || new Date().toISOString().split('T')[0];
      const slot = await findEarliestAvailableSlot({
        businessId,
        serviceId,
        requestedDate: targetDate,
        currentTimeOverride: currentTimeOverride || null
      });

      if (!slot.available) {
        throw new Error(slot.message || 'No appointment slots available for the selected dates.');
      }

      // 4. Find or create Customer record
      let customer = await tx.customer.findFirst({
        where: {
          businessId,
          OR: [{ phone }, { email: email || undefined }]
        }
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            businessId,
            name,
            phone,
            email: email || null,
            address,
            city,
            zipCode
          }
        });
      } else {
        // Update contact/address details if provided
        customer = await tx.customer.update({
          where: { id: customer.id },
          data: { name, address, city, zipCode, phone, email: email || customer.email }
        });
      }

      // 5. Generate unique reference number
      const referenceNumber = `SR-${Math.floor(100000 + Math.random() * 900000)}`;

      // 6. Create Appointment record
      const appointment = await tx.appointment.create({
        data: {
          businessId,
          customerId: customer.id,
          serviceId: service.id,
          referenceNumber,
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          estimatedArrival: slot.estimatedArrival,
          durationMinutes: service.durationMinutes,
          status: 'SCHEDULED',
          notes: `Urgency: ${urgency || 'ROUTINE'}. Customer note: ${problemDescription}`
        }
      });

      // 7. Create ServiceRequest record
      const serviceRequest = await tx.serviceRequest.create({
        data: {
          businessId,
          customerId: customer.id,
          serviceId: service.id,
          appointmentId: appointment.id,
          problemDescription: problemDescription || '',
          urgency: urgency || 'ROUTINE',
          photoUrls: Array.isArray(photoUrls) ? JSON.stringify(photoUrls) : (photoUrls || null),
          status: 'SCHEDULED'
        }
      });

      return {
        appointment,
        serviceRequest,
        customer,
        business,
        service,
        slot
      };
    });

    // 8. Trigger async notifications
    const { appointment, serviceRequest, customer, business, service } = bookingResult;
    appointment.service = service;
    serviceRequest.customer = customer;

    NotificationService.sendBookingConfirmation(appointment, customer, business).catch(console.error);
    NotificationService.sendBusinessNewLeadNotification(serviceRequest, appointment, business).catch(console.error);

    const isToday = appointment.date === new Date().toISOString().split('T')[0];
    const dateText = isToday ? 'today' : appointment.date;

    const arrivalWording = business.arrivalWindowType === 'EXACT'
      ? `Your appointment is scheduled for ${appointment.estimatedArrival} on ${dateText}.`
      : `Based on the company's current availability, your estimated arrival time is ${appointment.estimatedArrival} (${dateText}).`;

    res.status(201).json({
      success: true,
      message: 'Your service request has been scheduled.',
      referenceNumber: appointment.referenceNumber,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      estimatedArrival: appointment.estimatedArrival,
      arrivalWording,
      serviceName: service.name,
      customerName: customer.name,
      address: `${customer.address}, ${customer.city} ${customer.zipCode}`,
      appointmentId: appointment.id,
      serviceRequestId: serviceRequest.id
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPublicBusinessInfo,
  classifyService,
  checkAvailability,
  bookAppointment
};
