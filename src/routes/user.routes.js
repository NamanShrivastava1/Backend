import express from "express";
import { body } from "express-validator";
import * as userController from "../controllers/user.controller.js";
import * as middleware from "../middlewares/auth.js";


const router = express.Router();

router.post(
  "/register",
  [
    body("fullname")
      .notEmpty()
      .withMessage("Full name is required")
      .isLength({ min: 3 })
      .withMessage("Full name must be at least 3 characters long"),
    body("email").isEmail().withMessage("Please enter a valid email address"),
    body("mobile")
      .notEmpty()
      .withMessage("Mobile number is required")
      .isLength({ min: 10, max: 15 })
      .withMessage("Mobile number must be between 10 and 15 digits"),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  userController.registerUser,
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email address"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  userController.loginUser,
);

router.get(
  "/dashboard/profile",
  middleware.authenticateUser,
  userController.getUserProfile,
);

router.get("/me", middleware.authenticateUser, userController.getCurrentUser);

router.get("/logout", middleware.authenticateUser, userController.logoutUser);

router.delete(
  "/delete",
  middleware.authenticateUser,
  userController.deleteUser,
);

router.post("/verify-otp", userController.verifyOtp);

export default router;
