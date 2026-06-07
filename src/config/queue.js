const { Queue } = require('bullmq');

const getRedisConfig = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const url = new URL(redisUrl);
  const config = {
    host: url.hostname,
    port: parseInt(url.port) || 6379,
    password: url.password || undefined,
    maxRetriesPerRequest: null
  };

  // Heroku Redis uses rediss:// (TLS)
  if (redisUrl.startsWith('rediss://')) {
    config.tls = { rejectUnauthorized: false };
  }

  return config;
};

const queueConnection = getRedisConfig();

const webhookQueue = new Queue('webhook-notifications', {
  connection: queueConnection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 500
  }
});

module.exports = { webhookQueue, queueConnection };
