const { body, query } = require('express-validator');

const validateUpload = [
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Dataset file (CSV) is required' });
    }
    next();
  }
];

const validateUpdate = [
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('retrain')
    .optional()
    .isBoolean()
    .withMessage('Retrain must be a boolean')
];

const validateQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('status')
    .optional()
    .isIn(['pending', 'uploading', 'processing', 'completed', 'failed', 'updated'])
    .withMessage('Invalid status filter'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate must be a valid ISO 8601 date')
];

module.exports = { validateUpload, validateUpdate, validateQuery };
