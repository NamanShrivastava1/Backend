import express from 'express';

import * as userController from '../controllers/user.controller.js';
import * as middleware from '../middlewares/auth.js';
import { validateLogin, validateRegistration } from '../validators/auth.validator.js';

const router = express.Router();

/**
 * @route       POST /api/v1/users/register
 * @description Register a new user
 * @access      Public
 */
router.post('/register', validateRegistration, userController.registerUser);

/**
 * @route       POST /api/v1/users/login
 * @description Authenticate user & get token
 * @access      Public
 */
router.post('/login', validateLogin, userController.loginUser);

/**
 * @route       GET /api/v1/users/dashboard/profile
 * @description Get user profile data for dashboard
 * @access      Private (Authenticated User)
 */
router.get('/dashboard/profile', middleware.authenticateUser, userController.getUserProfile);

/**
 * @route       GET /api/v1/users/me
 * @description Get currently logged-in user profile
 * @access      Private (Authenticated User)
 */
router.get('/me', middleware.authenticateUser, userController.getCurrentUser);

/**
 * @route       POST /api/v1/users/logout
 * @description Logout user and clear session/cookie
 * @access      Private (Authenticated User)
 */
router.post('/logout', middleware.authenticateUser, userController.logoutUser);

/**
 * @route       DELETE /api/v1/users/delete
 * @description Delete user account
 * @access      Private (Authenticated User)
 */
router.delete('/delete', middleware.authenticateUser, userController.deleteUser);

/**
 * @route       POST /api/v1/users/verify-otp
 * @description Verify OTP for account activation or verification
 * @access      Public
 */
router.post('/verify-otp', userController.verifyOtp);

/**
 * @route       POST /api/v1/users/resend-otp
 * @description Resend OTP for account activation or verification
 * @access      Public
 */
router.post('/resend-otp', userController.resendOtp);

/**
 * @route       POST /api/v1/users/forget-password
 * @description Forget password
 * @access      Public
 */
router.post('/forget-password', userController.forgetPassword);

/**
 * @route       POST /api/v1/users/reset-password
 * @description Reset password
 * @access      Private (Authenticated User)
 */
router.post('/reset-password', userController.resetPassword);

export default router;
