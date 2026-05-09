import express from 'express';

import * as menuController from '../controllers/menu.controller.js';
import * as cafeMiddleware from '../middlewares/cafeAuth.js';
import { uploadMultiple } from '../utils/multer.js';
import { validateMenu } from '../validators/menu.validator.js';

const router = express.Router();

// Add menu item (authenticated cafe owner)
router.post('/', validateMenu, cafeMiddleware.authenticateCafe, menuController.addMenuItems);

// Get my cafe's menu (authenticated cafe owner)
router.get('/my-menu', cafeMiddleware.authenticateCafe, menuController.getMyMenuItems);

// Upload menu item images - max 5 images (authenticated cafe owner) - SPECIFIC ROUTE
router.post(
  '/upload-images/:menuItemId',
  cafeMiddleware.authenticateCafe,
  uploadMultiple,
  menuController.uploadMenuItemImages
);

// Toggle menu item availability (authenticated cafe owner) - SPECIFIC ROUTE
router.put(
  '/availability/:id',
  cafeMiddleware.authenticateCafe,
  menuController.toggleMenuItemAvailability
);

// Get public menu for a cafe (specific route)
router.get('/public/:cafeId', menuController.publicMenuController);

// Update menu item (authenticated cafe owner) - GENERIC ROUTE with PUT
router.put('/:menuItemId', cafeMiddleware.authenticateCafe, menuController.updateMenuItem);

// Delete menu item (authenticated cafe owner) - GENERIC ROUTE with DELETE
router.delete('/:menuItemId', cafeMiddleware.authenticateCafe, menuController.deleteMenuItem);

// Get menu items for a cafe (public) - GENERIC ROUTE - LAST
router.get('/:cafeId', menuController.getMenuItemsByCafe);

export default router;
