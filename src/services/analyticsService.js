const requestLogRepository = require('../repositories/requestLogRepository');

async function getAnalytics(tenantId) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return requestLogRepository.getAnalytics(tenantId, since);
}

module.exports = { getAnalytics };
