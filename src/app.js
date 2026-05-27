import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import morganLogger from './loggers/morgan.logger.js';
import cafeRoutes from './routes/cafe.routes.js';
import menuRoutes from './routes/menu.routes.js';
import userRoutes from './routes/user.routes.js';
import AppError from './utils/appError.js';

const app = express();

app.use(morganLogger);
app.set('trust proxy', 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet({ crossOriginResourcePolicy: false }));

const allowedOrigins = ['http://localhost:8080', 'https://scan-dine.vercel.app'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new AppError('Not allowed by CORS', 403));
    },
    credentials: true,
  })
);

// Rate Limiters
// Public APIs (relaxed)
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many requests. Please slow down.' },
});

// Auth APIs (strict)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many authentication attempts.' },
});

// Login APIs (very strict)
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts.' },
});

// OTP APIs (extremely strict)
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: { error: 'Too many OTP requests.' },
});

// Public routes
app.use('/api/v1/cafe/public-cafes', publicLimiter);
app.use('/api/v1/menu/public', publicLimiter);

// Auth routes
app.use('/api/v1/users/register', authLimiter);
app.use('/api/v1/users/forget-password', authLimiter);

// Login route
app.use('/api/v1/users/login', loginLimiter);

// OTP routes
app.use('/api/v1/users/verify-otp', otpLimiter);
app.use('/api/v1/users/resend-otp', otpLimiter);

// Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/menu', menuRoutes);
app.use('/api/v1/cafe', cafeRoutes);

// Health Check
app.get('/health', (req, res) => res.json({ status: 'OK' }));

// 404 Handler
app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// Global Error Handler
app.use((error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (error.name === 'JsonWebTokenError') {
    error.statusCode = 401;
    error.status = 'fail';
    error.message = 'Invalid token';
  }

  if (error.name === 'TokenExpiredError') {
    error.statusCode = 401;
    error.status = 'fail';
    error.message = 'Token expired. Please log in again';
  }

  if (error.name === 'CastError') {
    error.statusCode = 400;
    error.status = 'fail';
    error.message = `Invalid ${error.path}: ${error.value}`;
  }

  if (error.code === 11000) {
    error.statusCode = 400;
    error.status = 'fail';
    error.message = 'Duplicate field value entered';
  }

  if (error.name === 'ValidationError') {
    error.statusCode = 400;
    error.status = 'fail';
    error.message = Object.values(error.errors)
      .map((e) => e.message)
      .join(', ');
  }

  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

export default app;
