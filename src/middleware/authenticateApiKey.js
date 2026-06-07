const apiKeyRepository = require('../repositories/apiKeyRepository');
const hashKey = require('../utils/hashKey');

const authenticateApiKey = async (req, res, next) => {
  try {
    const rawKey = req.headers['x-api-key'];
    
    if (!rawKey) {
      return res.status(401).json({ error: 'Missing API key' });
    }

    const hash = hashKey(rawKey);
    const row = await apiKeyRepository.findByHash(hash);

    if (!row) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    if (!row.is_active) {
      return res.status(403).json({ error: 'API key inactive' });
    }

    req.apiKey = {
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      tier: row.tier,
      rateLimit: row.rate_limit,
      windowSizeSeconds: row.window_size_seconds,
      webhookUrl: row.webhook_url
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { authenticateApiKey };
