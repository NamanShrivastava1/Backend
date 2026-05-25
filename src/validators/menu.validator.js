import { body, validationResult } from 'express-validator';

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

export const validateMenu = [
  body('dishName').notEmpty().withMessage('Dish name is required'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isNumeric()
    .withMessage('Price must be a number'),
  body('category').notEmpty().withMessage('Category is required'),

  validateRequest,
];
