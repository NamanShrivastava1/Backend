import express from "express";
import { body } from "express-validator";
import * as cafeController from "../controllers/cafe.controller.js";
import * as userMiddleware from "../middlewares/auth.js";
import * as cafeMiddleware from "../middlewares/cafeAuth.js";

const router = express.Router();

router.post("/cafeinfo", [
    body("cafename")
        .notEmpty()
        .withMessage("Cafe name is required"),
    body("address")
        .notEmpty()
        .withMessage("Cafe address is required"),
    body("phoneNo")
        .notEmpty()
        .withMessage("Cafe contact number is required")
        .isLength({ min: 10, max: 15 })
        .withMessage("Contact number must be between 10 and 15 digits"),
], userMiddleware.authenticateUser, cafeController.cafeInfo)

router.get("/showCafe", userMiddleware.authenticateUser, cafeController.showCafeInfo);

router.post("/menu", [
    body("dishName")
        .notEmpty()
        .withMessage("Dish name is required"),
    body("price")
        .notEmpty()
        .withMessage("Price is required")
        .isNumeric()
        .withMessage("Price must be a number"),
    body("category")
        .notEmpty()
        .withMessage("Category is required")
], cafeMiddleware.authenticateCafe, cafeController.addMenuItems);

// for dashboard context
router.get("/my-menu", cafeMiddleware.authenticateCafe, cafeController.getMyMenuItems);

router.get("/menu/:cafeId", cafeController.getMenuItemsByCafe);

router.put("/menu/:menuItemId", cafeMiddleware.authenticateCafe, cafeController.updateMenuItem);

router.delete("/menu/:menuItemId", cafeMiddleware.authenticateCafe, cafeController.deleteMenuItem);

router.get("/generate-qr", cafeMiddleware.authenticateCafe, cafeController.generateQRCode);

router.get("/public-cafes", cafeController.publicCafeController)

router.get("/public-menu/:cafeId", cafeController.publicMenuController);

router.put("/menu/:id/toggle-availability", cafeController.toggleAvailability);



export default router;
