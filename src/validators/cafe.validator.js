import { body, validationResult } from 'express-validator';

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

export const validateCafe = [
  body('cafename').notEmpty().withMessage('Cafe name is required'),
  body('address').notEmpty().withMessage('Cafe address is required'),
  body('phoneNo')
    .notEmpty()
    .withMessage('Cafe contact number is required')
    .isLength({ min: 10, max: 15 })
    .withMessage('Contact number must be between 10 and 15 digits'),

  validateRequest,
];

export const validateCafeUpdate = [
  body('cafename').optional().notEmpty().withMessage('Cafe name cannot be empty'),
  body('address').optional().notEmpty().withMessage('Cafe address cannot be empty'),
  body('phoneNo')
    .optional()
    .notEmpty()
    .withMessage('Cafe contact number is required')
    .isLength({ min: 10, max: 15 })
    .withMessage('Contact number must be between 10 and 15 digits'),
  body('description').optional().trim(),

  validateRequest,
];
