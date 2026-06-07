const { Queue } = require('bullmq');

const getRedisConfig = () => {
  const url = new URL(process.env.REDIS_URL || 'redis://localhost:6379');
  return {
    host: url.hostname,
    port: parseInt(url.port) || 6379,
    password: url.password || undefined,
    maxRetriesPerRequest: null
  };
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
