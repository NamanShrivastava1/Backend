import express from 'express';

import * as cafeController from '../controllers/cafe.controller.js';
import * as userMiddleware from '../middlewares/auth.js';
import * as cafeMiddleware from '../middlewares/cafeAuth.js';
import { uploadSingle } from '../utils/multer.js';
import { validateCafe, validateCafeUpdate } from '../validators/cafe.validator.js';

const router = express.Router();

// Create cafe (authenticated user)
router.post(
  '/createCafe',
  validateCafe,
  userMiddleware.authenticateUser,
  cafeController.createCafe
);

// Get cafe info (authenticated user)
router.get('/showCafe', userMiddleware.authenticateUser, cafeController.showCafeInfo);

// Generate QR code (cafe owner)
router.get('/generate-qr', cafeMiddleware.authenticateCafe, cafeController.generateQRCode);

// Upload cafe image (authenticated cafe owner)
router.post(
  '/upload-image',
  cafeMiddleware.authenticateCafe,
  uploadSingle,
  cafeController.uploadCafeImage
);

// Update cafe information (authenticated cafe owner)
router.put(
  '/updateCafe',
  cafeMiddleware.authenticateCafe,
  uploadSingle,
  validateCafeUpdate,
  cafeController.updateCafe
);

// Get all public cafes (public)
router.get('/public-cafes', cafeController.publicCafeController);

export default router;
