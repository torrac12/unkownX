const ApiError = require('../utils/ApiError');

const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, 'NOT_FOUND', `Route ${req.originalUrl} not found`));
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.statusCode || 500;
  const payload = {
    code: err.code || 'INTERNAL_ERROR',
    message: err.message || 'Internal server error',
  };

  if (err.details) {
    payload.details = err.details;
  }

  if (process.env.NODE_ENV === 'development' && !err.details) {
    payload.details = err.stack;
  }

  res.status(status).json(payload);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
