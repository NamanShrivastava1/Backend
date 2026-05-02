import express from "express";

import * as userController from "../controllers/user.controller.js";
import * as middleware from "../middlewares/auth.js";
import {
  validateLogin,
  validateRegistration,
} from "../validators/auth.validator.js";

const router = express.Router();

router.post("/register", validateRegistration, userController.registerUser);

router.post("/login", validateLogin, userController.loginUser);

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
