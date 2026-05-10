import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';

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
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts, please try again later.' },
});

app.use('/api/', apiLimiter);
app.use('/api/users/login', loginLimiter);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/cafe', cafeRoutes);

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
