import mongoose from 'mongoose';
import logger from '../loggers/winston.logger.js';
import { config } from './config.js';

async function connectToDB() {
  mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
  mongoose.connection.on('error', (err) => logger.error('MongoDB error', { error: err.message }));

  try {
    await mongoose.connect(config.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  } catch (error) {
    logger.error('Failed to connect to MongoDB', { error: error.message });
    process.exit(1);
  }
}

export default connectToDB;
