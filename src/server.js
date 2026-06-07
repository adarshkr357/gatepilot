require('dotenv').config();

const requiredEnvVars = ['DATABASE_URL', 'REDIS_URL', 'ADMIN_TOKEN', 'TARGET_BASE_URL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const app = require('./app');
const { pool } = require('./config/db');
const redis = require('./config/redis');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await pool.query('SELECT 1');
    logger.info('Database connection verified');

    await redis.ping();
    logger.info('Redis connection verified');

    const server = app.listen(PORT, () => {
      logger.info(`GatePilot server listening on port ${PORT}`);
    });

    const shutdown = async () => {
      logger.info('Shutting down gracefully...');
      server.close(async () => {
        logger.info('HTTP server closed');
        await pool.end();
        await redis.quit();
        process.exit(0);
      });
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

start();
