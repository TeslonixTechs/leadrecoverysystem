/**
 * Centralized Error Handling Middleware
 * Converts unhandled server errors into clean, customer-friendly JSON responses.
 */
function errorHandler(err, req, res, next) {
  console.error('[SERVER ERROR]:', err);

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    error: err.message || 'An unexpected error occurred. Please try again or contact customer support.',
    code: err.code || 'INTERNAL_ERROR'
  });
}

module.exports = errorHandler;
