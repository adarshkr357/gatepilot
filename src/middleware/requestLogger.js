const loggingService = require('../services/loggingService');

const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const latencyMs = Date.now() - startTime;
    const rateLimited = res.statusCode === 429;
    
    if (req.apiKey) {
      loggingService.logRequest({
        tenantId: req.apiKey.tenantId,
        apiKeyId: req.apiKey.id,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        latencyMs,
        rateLimited,
        errorMessage: res.statusCode >= 400 ? res.statusMessage || null : null
      });
    }
  });
  
  next();
};

module.exports = { requestLogger };
