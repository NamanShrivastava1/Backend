import dotenv from 'dotenv';
dotenv.config();

const requiredVars = ['MONGO_URI', 'JWT_SECRET'];

requiredVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`${key} is not defined in environment variables`);
  }
});

if (process.env.NODE_ENV === 'production') {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('⚠️ Google OAuth not configured');
  }

  if (!process.env.EMAIL_USER || !process.env.REFRESH_TOKEN) {
    console.warn('⚠️ Email service not configured');
  }
}

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 4000,

  // core
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  REFRESH_TOKEN: process.env.REFRESH_TOKEN,
  EMAIL_USER: process.env.EMAIL_USER,

  IMAGE_KIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
};
