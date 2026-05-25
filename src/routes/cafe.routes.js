import express from 'express';

import * as cafeController from '../controllers/cafe.controller.js';
import * as userMiddleware from '../middlewares/auth.js';
import * as cafeMiddleware from '../middlewares/cafeAuth.js';
import { uploadSingle } from '../utils/multer.js';
import { validateCafe, validateCafeUpdate } from '../validators/cafe.validator.js';

const router = express.Router();

/**
 * @route       POST /api/v1/cafe/createCafe
 * @description Create a new cafe for the authenticated user
 * @access      Private (Authenticated User)
 */
router.post(
  '/createCafe',
  validateCafe,
  userMiddleware.authenticateUser,
  cafeController.createCafe
);

/**
 * @route       GET /api/v1/cafe/showCafe
 * @description Get cafe details for the authenticated user
 * @access      Private (Authenticated User)
 */
router.get('/showCafe', userMiddleware.authenticateUser, cafeController.showCafeInfo);

/**
 * @route       GET /api/v1/cafe/generate-qr
 * @description Generate QR code for the authenticated cafe
 * @access      Private (Authenticated Cafe Owner)
 */
router.get('/generate-qr', cafeMiddleware.authenticateCafe, cafeController.generateQRCode);

/**
 * @route       POST /api/v1/cafe/upload-image
 * @description Upload cafe image/logo
 * @access      Private (Authenticated Cafe Owner)
 */
router.post(
  '/upload-image',
  cafeMiddleware.authenticateCafe,
  uploadSingle,
  cafeController.uploadCafeImage
);

/**
 * @route       PUT /api/v1/cafe/updateCafe
 * @description Update cafe profile and details
 * @access      Private (Authenticated Cafe Owner)
 */
router.put(
  '/updateCafe',
  cafeMiddleware.authenticateCafe,
  uploadSingle,
  validateCafeUpdate,
  cafeController.updateCafe
);

/**
 * @route       GET /api/v1/cafe/public-cafes
 * @description Get a list of all public cafes
 * @access      Public
 */
router.get('/public-cafes', cafeController.publicCafeController);

export default router;
