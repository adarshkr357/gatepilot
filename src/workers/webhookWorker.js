require('dotenv').config();
const { Worker } = require('bullmq');
const axios = require('axios');
const { queueConnection } = require('../config/queue');
const logger = require('../utils/logger');

const worker = new Worker('webhook-notifications', async (job) => {
  const { event, tenantId, apiKeyId, limit, webhookUrl, timestamp } = job.data;
  
  logger.info(`Processing webhook job ${job.id}`, { event, tenantId, apiKeyId });
  
  const response = await axios.post(webhookUrl, {
    event,
    tenantId,
    apiKeyId,
    limit,
    timestamp
  }, {
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'GatePilot-Webhook/1.0'
    }
  });
  
  logger.info(`Webhook delivered successfully`, { 
    jobId: job.id, 
    status: response.status,
    tenantId 
  });
}, {
  connection: queueConnection,
  concurrency: 5
});

worker.on('completed', (job) => {
  logger.info(`Webhook job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  logger.error(`Webhook job ${job?.id} failed after ${job?.attemptsMade} attempts`, {
    error: err.message,
    data: job?.data
  });
});

logger.info('Webhook worker started, waiting for jobs...');

process.on('SIGTERM', async () => {
  logger.info('Webhook worker shutting down...');
  await worker.close();
  process.exit(0);
});
