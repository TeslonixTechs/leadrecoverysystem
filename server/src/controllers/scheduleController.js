const prisma = require('../config/prisma');

async function getScheduleSettings(req, res, next) {
  try {
    const businessHours = await prisma.businessHours.findMany({
      where: { businessId: req.user.businessId },
      orderBy: { dayOfWeek: 'asc' }
    });

    const blockedTimes = await prisma.blockedTime.findMany({
      where: { businessId: req.user.businessId },
      orderBy: { date: 'asc' }
    });

    const business = await prisma.business.findUnique({
      where: { id: req.user.businessId },
      select: { travelBufferMinutes: true, arrivalWindowType: true }
    });

    res.json({
      businessHours,
      blockedTimes,
      travelBufferMinutes: business?.travelBufferMinutes || 30,
      arrivalWindowType: business?.arrivalWindowType || 'ESTIMATED_WINDOW'
    });
  } catch (err) {
    next(err);
  }
}

async function updateBusinessHours(req, res, next) {
  try {
    const { hours } = req.body; // Array of { dayOfWeek, isOpen, openTime, closeTime }

    if (!Array.isArray(hours)) {
      return res.status(400).json({ error: 'Hours must be an array of day schedules.' });
    }

    const updatedHours = [];
    for (const item of hours) {
      const updated = await prisma.businessHours.upsert({
        where: {
          businessId_dayOfWeek: {
            businessId: req.user.businessId,
            dayOfWeek: Number(item.dayOfWeek)
          }
        },
        update: {
          isOpen: Boolean(item.isOpen),
          openTime: item.openTime,
          closeTime: item.closeTime
        },
        create: {
          businessId: req.user.businessId,
          dayOfWeek: Number(item.dayOfWeek),
          isOpen: Boolean(item.isOpen),
          openTime: item.openTime,
          closeTime: item.closeTime
        }
      });
      updatedHours.push(updated);
    }

    res.json(updatedHours);
  } catch (err) {
    next(err);
  }
}

async function createBlockedTime(req, res, next) {
  try {
    const { title, date, startTime, endTime, isRecurring } = req.body;

    if (!title || !date || !startTime || !endTime) {
      return res.status(400).json({ error: 'Title, date, start time, and end time are required.' });
    }

    const blocked = await prisma.blockedTime.create({
      data: {
        businessId: req.user.businessId,
        title,
        date,
        startTime,
        endTime,
        isRecurring: Boolean(isRecurring)
      }
    });

    res.status(201).json(blocked);
  } catch (err) {
    next(err);
  }
}

async function deleteBlockedTime(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.blockedTime.findFirst({
      where: { id, businessId: req.user.businessId }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Blocked period not found.' });
    }

    await prisma.blockedTime.delete({ where: { id } });

    res.json({ message: 'Blocked period removed.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getScheduleSettings,
  updateBusinessHours,
  createBlockedTime,
  deleteBlockedTime
};
