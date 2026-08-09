const prisma = require('../config/prisma');

async function getBusiness(req, res, next) {
  try {
    const business = await prisma.business.findUnique({
      where: { id: req.user.businessId }
    });
    if (!business) {
      return res.status(404).json({ error: 'Business settings not found.' });
    }
    res.json(business);
  } catch (err) {
    next(err);
  }
}

async function updateBusiness(req, res, next) {
  try {
    const {
      name,
      phone,
      email,
      address,
      city,
      state,
      zipCode,
      serviceArea,
      timezone,
      emergencyEnabled,
      travelBufferMinutes,
      arrivalWindowType
    } = req.body;

    const updated = await prisma.business.update({
      where: { id: req.user.businessId },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(zipCode !== undefined && { zipCode }),
        ...(serviceArea !== undefined && { serviceArea }),
        ...(timezone !== undefined && { timezone }),
        ...(emergencyEnabled !== undefined && { emergencyEnabled: Boolean(emergencyEnabled) }),
        ...(travelBufferMinutes !== undefined && { travelBufferMinutes: Number(travelBufferMinutes) }),
        ...(arrivalWindowType !== undefined && { arrivalWindowType })
      }
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getBusiness,
  updateBusiness
};
