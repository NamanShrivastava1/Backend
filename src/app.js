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

// Trust proxy for rate limiting & correct IP detection
app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = ['http://localhost:8080', 'https://scan-dine.vercel.app'];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.log('Blocked by CORS:', origin);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: { error: 'Too many requests, please try again later.' },
});

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // max 5 login attempts
  message: { error: 'Too many login attempts, please try again later.' },
});

app.use('/api/', apiLimiter);
app.use('/api/users/login', loginLimiter);
app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/cafe', cafeRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the ScanDine');
});
// 404 Route Handler
app.use((req, res, next) => {
  throw new AppError(`Route ${req.originalUrl} not found`, 404);
});

// Global Error Handling Middleware
app.use((error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  // Handle JWT errors
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

  // Handle Mongoose errors
  if (error.name === 'CastError') {
    error.statusCode = 400;
    error.status = 'fail';
    error.message = `Invalid ${error.path}: ${error.value}`;
  }

  if (error.code === 11000) {
    error.statusCode = 400;
    error.status = 'fail';
    error.message = `Duplicate field value entered`;
  }

  if (error.name === 'ValidationError') {
    error.statusCode = 400;
    error.status = 'fail';
    error.message = Object.values(error.errors)
      .map((e) => e.message)
      .join(', ');
  }

  const response = {
    status: error.status,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { error: error }),
  };

  res.status(error.statusCode).json(response);
});

export default app;
