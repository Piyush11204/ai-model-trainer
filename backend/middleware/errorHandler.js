const winston = require('winston');
const { validationResult } = require('express-validator');

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/app.log' }),
    new winston.transports.Console(),
  ],
});

const errorHandler = (err, req, res, next) => {
  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error('Validation error', { errors: errors.array(), method: req.method, url: req.url });
    return res.status(400).json({ errors: errors.array() });
  }

  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
  });

  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500,
    },
  });
};

module.exports = errorHandler;
