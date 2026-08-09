const prisma = require('../config/prisma');

async function getServices(req, res, next) {
  try {
    const services = await prisma.service.findMany({
      where: { businessId: req.user.businessId },
      orderBy: { createdAt: 'asc' }
    });
    res.json(services);
  } catch (err) {
    next(err);
  }
}

async function createService(req, res, next) {
  try {
    const { name, description, durationMinutes, isActive } = req.body;

    if (!name || !durationMinutes) {
      return res.status(400).json({ error: 'Service name and duration in minutes are required.' });
    }

    const newService = await prisma.service.create({
      data: {
        businessId: req.user.businessId,
        name,
        description: description || '',
        durationMinutes: Number(durationMinutes),
        isActive: isActive !== undefined ? Boolean(isActive) : true
      }
    });

    res.status(201).json(newService);
  } catch (err) {
    next(err);
  }
}

async function updateService(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, durationMinutes, isActive } = req.body;

    const existing = await prisma.service.findFirst({
      where: { id, businessId: req.user.businessId }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    const updated = await prisma.service.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(durationMinutes !== undefined && { durationMinutes: Number(durationMinutes) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) })
      }
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function deleteService(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.service.findFirst({
      where: { id, businessId: req.user.businessId }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    // Soft delete by setting isActive to false
    const deactivated = await prisma.service.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({ message: 'Service deactivated successfully.', service: deactivated });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getServices,
  createService,
  updateService,
  deleteService
};
