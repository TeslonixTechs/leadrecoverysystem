/**
 * Request Validation Middleware Generator using Zod
 */
function validateRequest(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err.errors) {
        const issues = err.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        return res.status(400).json({ error: 'Validation failed', details: issues });
      }
      return res.status(400).json({ error: 'Invalid request data' });
    }
  };
}

module.exports = {
  validateRequest
};
