const { checkRateLimit } = require('../services/rateLimitService');
const logger = require('../utils/logger');

const rateLimiter = async (req, res, next) => {
  try {
    const { id, rateLimit, windowSizeSeconds, webhookUrl, tenantId } = req.apiKey;
    
    const result = await checkRateLimit(id, rateLimit, windowSizeSeconds);
    
    res.set('X-RateLimit-Limit', String(result.limit));
    res.set('X-RateLimit-Remaining', String(result.remaining));
    res.set('X-RateLimit-Reset', String(result.resetTime));
    
    if (!result.allowed) {
      const retryAfter = Math.max(1, result.resetTime - Math.ceil(Date.now() / 1000));
      res.set('Retry-After', String(retryAfter));
      
      try {
        const webhookService = require('../services/webhookService');
        webhookService.enqueueQuotaExceeded({
          tenantId,
          apiKeyId: id,
          limit: rateLimit,
          webhookUrl
        }).catch(err => logger.error('Failed to enqueue webhook', { error: err.message }));
      } catch(e) { }
      
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter
      });
    }
    
    next();
  } catch (err) {
    logger.error('Rate limiter error, failing open', { error: err.message });
    next(); // fail open
  }
};

module.exports = { rateLimiter };
