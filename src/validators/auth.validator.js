import { body, validationResult } from 'express-validator';

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

export const validateRegistration = [
  body('fullname')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 3 })
    .withMessage('Full name must be at least 3 characters long'),
  body('email').isEmail().withMessage('Please enter a valid email address'),
  body('mobile')
    .notEmpty()
    .withMessage('Mobile number is required')
    .isLength({ min: 10, max: 15 })
    .withMessage('Mobile number must be between 10 and 15 digits'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  validateRequest,
];

export const validateLogin = [
  body('email').isEmail().withMessage('Please enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),

  validateRequest,
];
