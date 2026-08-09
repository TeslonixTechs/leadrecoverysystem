const prisma = require('../config/prisma');
const NotificationService = require('../services/notificationService');
const { format12Hour } = require('../services/schedulingService');

async function getAppointments(req, res, next) {
  try {
    const { status, date } = req.query;

    const whereClause = {
      businessId: req.user.businessId,
      ...(status && { status }),
      ...(date && { date })
    };

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        customer: true,
        service: true,
        serviceRequest: true
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    });

    res.json(appointments);
  } catch (err) {
    next(err);
  }
}

async function getAppointmentById(req, res, next) {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findFirst({
      where: { id, businessId: req.user.businessId },
      include: {
        customer: true,
        service: true,
        serviceRequest: true
      }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    res.json(appointment);
  } catch (err) {
    next(err);
  }
}

async function updateAppointment(req, res, next) {
  try {
    const { id } = req.params;
    const { status, date, startTime, endTime, notes } = req.body;

    const existing = await prisma.appointment.findFirst({
      where: { id, businessId: req.user.businessId },
      include: { customer: true, service: true }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    const estimatedArrival = startTime ? format12Hour(startTime) : existing.estimatedArrival;

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(date && { date }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
        ...(startTime && { estimatedArrival }),
        ...(notes !== undefined && { notes })
      },
      include: {
        customer: true,
        service: true
      }
    });

    // Notify customer on status update or reschedule
    const business = await prisma.business.findUnique({ where: { id: req.user.businessId } });
    if (business && updated.customer) {
      NotificationService.sendAppointmentUpdate(updated, updated.customer, business).catch(console.error);
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function cancelAppointment(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.appointment.findFirst({
      where: { id, businessId: req.user.businessId }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    const cancelled = await prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { customer: true, service: true }
    });

    // Also update associated service request status
    await prisma.serviceRequest.updateMany({
      where: { appointmentId: id },
      data: { status: 'CANCELLED' }
    });

    res.json({ message: 'Appointment cancelled.', appointment: cancelled });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment
};
