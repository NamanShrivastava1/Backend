import express from 'express';

import * as menuController from '../controllers/menu.controller.js';
import * as cafeMiddleware from '../middlewares/cafeAuth.js';
import { validateMenu } from '../validators/menu.validator.js';

const router = express.Router();

// Add menu item (authenticated cafe owner)
router.post('/', validateMenu, cafeMiddleware.authenticateCafe, menuController.addMenuItems);

// Get my cafe's menu (authenticated cafe owner)
router.get('/my-menu', cafeMiddleware.authenticateCafe, menuController.getMyMenuItems);

// Get menu items for a cafe (public)
router.get('/:cafeId', menuController.getMenuItemsByCafe);

// Update menu item (authenticated cafe owner)
router.put('/:menuItemId', cafeMiddleware.authenticateCafe, menuController.updateMenuItem);

// Delete menu item (authenticated cafe owner)
router.delete('/:menuItemId', cafeMiddleware.authenticateCafe, menuController.deleteMenuItem);

// Toggle menu item availability (authenticated cafe owner)
router.put(
  '/availability/:id',
  cafeMiddleware.authenticateCafe,
  menuController.toggleMenuItemAvailability
);

// Get public menu for a cafe (public)
router.get('/public/:cafeId', menuController.publicMenuController);

export default router;
