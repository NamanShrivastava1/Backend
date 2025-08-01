const express = require("express");
const router = express.Router();

const { body } = require("express-validator");

const userController = require("../controllers/user.controller");
const middleware = require("../middlewares/auth");

router.post(
    "/register",
    [
        body("fullname")
            .notEmpty()
            .withMessage("Full name is required")
            .isLength({ min: 3 })
            .withMessage("Full name must be at least 3 characters long"),
        body("email")
            .isEmail()
            .withMessage("Please enter a valid email address"),
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
    userController.registerUser
);

router.post(
    "/login",
    [
        body("email")
            .isEmail()
            .withMessage("Please enter a valid email address"),
        body("password")
            .notEmpty()
            .withMessage("Password is required"),
    ],
    userController.loginUser
);

router.get("/dashboard/profile", middleware.authenticateUser, userController.getUserProfile);

router.get("/me", middleware.authenticateUser, userController.getCurrentUser);

router.get("/logout", middleware.authenticateUser, userController.logoutUser);

router.delete("/delete", middleware.authenticateUser, userController.deleteUser);

module.exports = router