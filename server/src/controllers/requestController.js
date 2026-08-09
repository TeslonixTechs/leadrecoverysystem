const prisma = require('../config/prisma');

async function getServiceRequests(req, res, next) {
  try {
    const requests = await prisma.serviceRequest.findMany({
      where: { businessId: req.user.businessId },
      include: {
        customer: true,
        service: true,
        appointment: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Parse photoUrls JSON string if present
    const formatted = requests.map(r => ({
      ...r,
      photoUrls: r.photoUrls ? JSON.parse(r.photoUrls) : []
    }));

    res.json(formatted);
  } catch (err) {
    next(err);
  }
}

async function getServiceRequestById(req, res, next) {
  try {
    const { id } = req.params;

    const request = await prisma.serviceRequest.findFirst({
      where: { id, businessId: req.user.businessId },
      include: {
        customer: true,
        service: true,
        appointment: true
      }
    });

    if (!request) {
      return res.status(404).json({ error: 'Service request not found.' });
    }

    res.json({
      ...request,
      photoUrls: request.photoUrls ? JSON.parse(request.photoUrls) : []
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getServiceRequests,
  getServiceRequestById
};
