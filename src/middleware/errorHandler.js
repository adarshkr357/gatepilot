const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  const response = { error: message };
  
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
