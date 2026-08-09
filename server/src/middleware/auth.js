const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'serviceflow_jwt_secret_key_demo_2026';

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user payload to req.user.
 * Enforces business-level data isolation.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired authentication token.' });
  }
}

module.exports = {
  authenticateToken,
  JWT_SECRET
};
