const { webhookQueue } = require('../config/queue');

const enqueueQuotaExceeded = async ({ tenantId, apiKeyId, limit, webhookUrl }) => {
  if (!webhookUrl) return;
  
  await webhookQueue.add('quota_exceeded', {
    event: 'quota_exceeded',
    tenantId,
    apiKeyId,
    limit,
    webhookUrl,
    timestamp: new Date().toISOString()
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  });
};

module.exports = { enqueueQuotaExceeded };
