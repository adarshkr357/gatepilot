const requestLogRepository = require('../repositories/requestLogRepository');
const logger = require('../utils/logger');

async function logRequest(data) {
  try {
    await requestLogRepository.create(data);
  } catch (error) {
    logger.error('Failed to log request to database', {
      error: error.message,
      requestData: { method: data.method, path: data.path, tenantId: data.tenantId }
    });
  }
}

module.exports = { logRequest };
