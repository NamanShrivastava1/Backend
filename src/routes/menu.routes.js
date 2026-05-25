import express from 'express';

import * as menuController from '../controllers/menu.controller.js';
import * as cafeMiddleware from '../middlewares/cafeAuth.js';
import { uploadMultiple } from '../utils/multer.js';
import { validateMenu } from '../validators/menu.validator.js';

const router = express.Router();

/**
 * @route       POST /api/v1/menu/
 * @description Add a new menu item to the cafe
 * @access      Private (Authenticated Cafe Owner)
 */
router.post('/', validateMenu, cafeMiddleware.authenticateCafe, menuController.addMenuItems);

/**
 * @route       GET /api/v1/menu/my-menu
 * @description Get all menu items for the authenticated cafe
 * @access      Private (Authenticated Cafe Owner)
 */
router.get('/my-menu', cafeMiddleware.authenticateCafe, menuController.getMyMenuItems);

/**
 * @route       POST /api/v1/menu/upload-images/:menuItemId
 * @description Upload up to 5 images for a menu item
 * @access      Private (Authenticated Cafe Owner)
 */
router.post(
  '/upload-images/:menuItemId',
  cafeMiddleware.authenticateCafe,
  uploadMultiple,
  menuController.uploadMenuItemImages
);

/**
 * @route       PUT /api/v1/menu/availability/:id
 * @description Toggle the availability status of a menu item
 * @access      Private (Authenticated Cafe Owner)
 */
router.put(
  '/availability/:id',
  cafeMiddleware.authenticateCafe,
  menuController.toggleMenuItemAvailability
);

/**
 * @route       GET /api/v1/menu/public/:cafeId
 * @description Get public menu items for a specific cafe
 * @access      Public
 */
router.get('/public/:cafeId', menuController.publicMenuController);

/**
 * @route       PUT /api/v1/menu/:menuItemId
 * @description Update details of a specific menu item
 * @access      Private (Authenticated Cafe Owner)
 */
router.put('/:menuItemId', cafeMiddleware.authenticateCafe, menuController.updateMenuItem);

/**
 * @route       DELETE /api/v1/menu/:menuItemId
 * @description Delete a specific menu item
 * @access      Private (Authenticated Cafe Owner)
 */
router.delete('/:menuItemId', cafeMiddleware.authenticateCafe, menuController.deleteMenuItem);

/**
 * @route       GET /api/v1/menu/:cafeId
 * @description Get all menu items for a specific cafe
 * @access      Public
 */
router.get('/:cafeId', menuController.getMenuItemsByCafe);

export default router;
