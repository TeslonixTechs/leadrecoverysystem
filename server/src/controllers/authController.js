const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { JWT_SECRET } = require('../middleware/auth');

async function register(req, res, next) {
  try {
    const { email, password, name, businessName } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const slug = (businessName || 'my-business').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);

    const business = await prisma.business.create({
      data: {
        name: businessName || 'Summit Ridge Roofing',
        slug,
        phone: '(555) 234-5678',
        email,
        serviceArea: 'Dallas-Fort Worth Metroplex',
        timezone: 'America/Chicago',
        ratingScore: 4.9,
        ratingCount: 128,
        emergencyEnabled: true,
        travelBufferMinutes: 30,
        arrivalWindowType: 'ESTIMATED_WINDOW'
      }
    });

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'ADMIN',
        businessId: business.id
      }
    });

    // Create default business hours (Mon-Fri 8-6, Sat 9-2, Sun Closed)
    const defaultHours = [
      { dayOfWeek: 0, isOpen: false, openTime: '09:00', closeTime: '17:00' },
      { dayOfWeek: 1, isOpen: true, openTime: '08:00', closeTime: '18:00' },
      { dayOfWeek: 2, isOpen: true, openTime: '08:00', closeTime: '18:00' },
      { dayOfWeek: 3, isOpen: true, openTime: '08:00', closeTime: '18:00' },
      { dayOfWeek: 4, isOpen: true, openTime: '08:00', closeTime: '18:00' },
      { dayOfWeek: 5, isOpen: true, openTime: '08:00', closeTime: '18:00' },
      { dayOfWeek: 6, isOpen: true, openTime: '09:00', closeTime: '14:00' }
    ];

    for (const dh of defaultHours) {
      await prisma.businessHours.create({
        data: {
          businessId: business.id,
          ...dh
        }
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, businessId: business.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, role: user.role, businessId: business.id },
      business
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { business: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, businessId: user.businessId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, businessId: user.businessId },
      business: user.business
    });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        businessId: true,
        business: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  getMe
};
