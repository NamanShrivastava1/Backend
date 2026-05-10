import crypto from 'crypto';

import { validationResult } from 'express-validator';

import blackListTokenModel from '../models/blacklistToken.model.js';
import userModel from '../models/user.model.js';
import { sendMail } from '../services/email.service.js';
import AppError from '../utils/appError.js';
import { otpVerificationTemplate } from '../utils/emailTemplates.js';

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

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email using the OTP sent.',
      user,
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
      token,
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
    res.status(200).json({
      message: 'User profile retrieved successfully',
      user,
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

    res.status(200).json({ user });
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

    if (!user.otp || !user.otpExpiry) {
      throw new AppError('OTP not generated', 400);
    }

    if (user.otpExpiry < Date.now()) {
      throw new AppError('OTP has expired. Please request a new one', 400);
    }

    // Hash entered OTP to compare with DB
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    if (hashedOtp !== user.otp) {
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
