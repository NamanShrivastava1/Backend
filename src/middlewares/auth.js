import jwt from 'jsonwebtoken';

import blacklistTokenModel from '../models/blacklistToken.model.js';
import userModel from '../models/user.model.js';
import AppError from '../utils/appError.js';

export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new AppError('Authentication token is missing', 401);
    }

    const isBlacklisted = await blacklistTokenModel.findOne({ token });
    if (isBlacklisted) {
      throw new AppError('Session expired. Please log in again', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded._id).select('+password');
    if (!user) {
      throw new AppError('Invalid or expired token', 401);
    }

    if (user.jwtVersion !== decoded.jwtVersion) {
      throw new AppError('Session expired. Please login again', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
