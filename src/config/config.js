import dotenv from 'dotenv';
dotenv.config();

const requiredVars = ['MONGO_URI', 'JWT_SECRET'];

requiredVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 4000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  REFRESH_TOKEN: process.env.REFRESH_TOKEN,
  EMAIL_USER: process.env.EMAIL_USER,
  IMAGE_KIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
};

// called after logger is ready in index.js
export const warnOptionalVars = (logger) => {
  if (config.NODE_ENV === 'production') {
    if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET)
      logger.warn('Google OAuth not configured');
    if (!config.EMAIL_USER || !config.REFRESH_TOKEN) logger.warn('Email service not configured');
    if (!config.IMAGE_KIT_PRIVATE_KEY)
      logger.warn('ImageKit not configured — image uploads will fail');
  }
};
