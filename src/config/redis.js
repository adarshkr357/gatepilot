const Redis = require('ioredis');
const logger = require('../utils/logger');

const redisUrl = process.env.REDIS_URL;
const redisOpts = {
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
};

// Heroku Redis uses rediss:// (TLS) — accept self-signed certs
if (redisUrl && redisUrl.startsWith('rediss://')) {
  redisOpts.tls = { rejectUnauthorized: false };
}

const redis = new Redis(redisUrl, redisOpts);

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

redis.on('error', (err) => {
  logger.error('Redis connection error', { error: err.message });
});

module.exports = redis;
