import app from './src/app.js';
import { config, warnOptionalVars } from './src/config/config.js';
import connectToDB from './src/config/db.js';
import logger from './src/loggers/winston.logger.js';

const startServer = async () => {
  try {
    warnOptionalVars(logger); // warn about missing optional env vars

    await connectToDB();

    const server = app.listen(config.PORT, () => {
      logger.info('Server started', {
        port: config.PORT,
        env: config.NODE_ENV,
      });
    });

    // Unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION — shutting down', {
        error: err.message,
        stack: err.stack,
      });
      server.close(() => process.exit(1));
    });

    // Uncaught exceptions
    process.on('uncaughtException', (err) => {
      logger.error('UNCAUGHT EXCEPTION — shutting down', {
        error: err.message,
        stack: err.stack,
      });
      process.exit(1);
    });

    // Render sends SIGTERM on restart/deploy
    // Finish ongoing requests first -> Then stop server
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received — shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Error starting server', { error: error.message });
    process.exit(1);
  }
};

startServer();
