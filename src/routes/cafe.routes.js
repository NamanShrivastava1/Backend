import express from "express";

import * as cafeController from "../controllers/cafe.controller.js";
import * as userMiddleware from "../middlewares/auth.js";
import * as cafeMiddleware from "../middlewares/cafeAuth.js";
import { validateCafe } from "../validators/cafe.validator.js";
import { validateMenu } from "../validators/menu.validator.js";

const router = express.Router();

router.post(
  "/cafeinfo",
  validateCafe,
  userMiddleware.authenticateUser,
  cafeController.createCafe,
);

router.get(
  "/showCafe",
  userMiddleware.authenticateUser,
  cafeController.showCafeInfo,
);

router.post(
  "/menu",
  validateMenu,
  cafeMiddleware.authenticateCafe,
  cafeController.addMenuItems,
);

// for dashboard context
router.get(
  "/my-menu",
  cafeMiddleware.authenticateCafe,
  cafeController.getMyMenuItems,
);

router.get("/menu/:cafeId", cafeController.getMenuItemsByCafe);

router.put(
  "/menu/:menuItemId",
  cafeMiddleware.authenticateCafe,
  cafeController.updateMenuItem,
);

router.delete(
  "/menu/:menuItemId",
  cafeMiddleware.authenticateCafe,
  cafeController.deleteMenuItem,
);

router.get(
  "/generate-qr",
  cafeMiddleware.authenticateCafe,
  cafeController.generateQRCode,
);

router.get("/public-cafes", cafeController.publicCafeController);

router.get("/public-menu/:cafeId", cafeController.publicMenuController);

router.put("/menu/:id/toggle-availability", cafeController.toggleAvailability);

export default router;
