import crypto from 'crypto';

import { validationResult } from 'express-validator';

import blackListTokenModel from '../models/blacklistToken.model.js';
import userModel from '../models/user.model.js';
import { sendMail } from '../services/email.service.js';
import AppError from '../utils/appError.js';
import {
  otpVerificationTemplate,
  resendOtpTemplate,
  resetPasswordTemplate,
} from '../utils/emailTemplates.js';

export const sanitizeUser = (user) => {
  return {
    _id: user._id,
    fullname: user.fullname,
    email: user.email,
    mobile: user.mobile,
    isVerified: user.isVerified,
  };
};

export const registerUser = async (req, res, next) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      throw new AppError(error.array()[0].msg || 'Validation failed', 400);
    }

    const { fullname, email, mobile, password } = req.body;

    if (!fullname || !email || !mobile || !password) {
      throw new AppError('All fields are required', 400);
    }

    const isUserExists = await userModel.findOne({
      $or: [{ email }, { mobile }],
    });
    if (isUserExists) {
      throw new AppError('User with this email or mobile already exists', 400);
    }

    const hashedPassword = await userModel.hashPassword(password);

    const otp = Math.floor(100000 + crypto.randomInt(900000)).toString();

    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await userModel.create({
      fullname,
      email,
      mobile,
      password: hashedPassword,
      otp: hashedOtp,
      otpExpiry: Date.now() + 5 * 60 * 1000, // 5 mins
    });

    await sendMail(email, 'Verify your ScanDine Account', otpVerificationTemplate(fullname, otp));

    const safeUser = sanitizeUser(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email using the OTP sent.',
      safeUser,
      userId: user._id, // send userId for OTP verification
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      throw new AppError(error.array()[0].msg || 'Validation failed', 400);
    }

    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const user = await userModel.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isVerified) {
      throw new AppError('You are not Verified');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    user.jwtVersion += 1;
    await user.save();

    const token = user.generateAuthToken();
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    res.status(200).json({
      message: 'Login successful',
      // token,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await userModel.findById(userId).select('-password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const safeUser = sanitizeUser(user);
    res.status(200).json({
      message: 'User profile retrieved successfully',
      safeUser,
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      throw new AppError('Not authenticated', 401);
    }
    if (!user.isVerified) {
      throw new AppError('Please verify your email to access this resource', 403);
    }

    const safeUser = sanitizeUser(user);

    res.status(200).json({ safeUser });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new AppError('No token provided to logout', 400);
    }

    await blackListTokenModel.create({ token });

    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await userModel.findOneAndDelete({ _id: userId });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.clearCookie('token');
    res.status(200).json({
      message: 'User account and associated data deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      throw new AppError('User ID and OTP are required', 400);
    }

    const user = await userModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.isVerified) {
      throw new AppError('User already verified', 400);
    }

    if (!user.otp || !user.otpExpiry) {
      throw new AppError('OTP not generated', 400);
    }

    if (user.otpExpiry < Date.now()) {
      user.otp = undefined;
      user.otpExpiry = undefined;

      await user.save();

      throw new AppError('OTP has expired. Please request a new one', 400);
    }

    // Hash entered OTP to compare with DB
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    const isOtpValid = crypto.timingSafeEqual(Buffer.from(hashedOtp), Buffer.from(user.otp));

    if (!isOtpValid) {
      throw new AppError('Invalid OTP', 400);
    }

    // Mark user as verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};

export const resendOtp = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      throw new AppError('User ID is required', 400);
    }

    const user = await userModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.isVerified) {
      throw new AppError('User already verified', 400);
    }

    const otp = Math.floor(100000 + crypto.randomInt(900000)).toString();
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    user.otp = hashedOtp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 mins
    await user.save();

    await sendMail(
      user.email,
      'Your New ScanDine Verification Code',
      resendOtpTemplate(user.fullname, otp)
    );

    res.status(200).json({
      message: 'OTP sent successfully. Please verify your email',
      userId: user._id,
    });
  } catch (error) {
    next(error);
  }
};

export const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const otp = Math.floor(100000 + crypto.randomInt(900000)).toString();

    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    user.resetPasswordOtp = hashedOtp;

    user.resetPasswordOtpExpiry = Date.now() + 5 * 60 * 1000;

    await user.save();

    await sendMail(
      user.email,
      'Reset Your ScanDine Password',
      resetPasswordTemplate(user.fullname, otp)
    );

    res.status(200).json({
      message: 'Password reset OTP sent successfully',
      userId: user._id,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { userId, otp, newPassword } = req.body;

    if (!userId || !otp || !newPassword) {
      throw new AppError('User ID, OTP, and new password are required', 400);
    }

    const user = await userModel.findById(userId).select('+password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.resetPasswordOtpExpiry < Date.now()) {
      throw new AppError('Password reset OTP has expired', 400);
    }

    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(hashedOtp), Buffer.from(user.resetPasswordOtp))) {
      throw new AppError('Invalid OTP', 400);
    }

    // Hash new password
    user.password = await userModel.hashPassword(newPassword);

    // Clear reset password fields
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpiry = undefined;

    // Save user
    await user.save();

    // Clear sensitive cookie if exists
    res.clearCookie('token');

    res.status(200).json({
      message: 'Password reset successful. Please login with your new password',
    });
  } catch (error) {
    next(error);
  }
};
