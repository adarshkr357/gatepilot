const apiKeyRepository = require('../repositories/apiKeyRepository');
const generateApiKey = require('../utils/generateApiKey');

async function createKey(data) {
  const { raw, hash, prefix } = generateApiKey();
  
  const created = await apiKeyRepository.create({
    tenantId: data.tenantId,
    name: data.name,
    keyHash: hash,
    keyPrefix: prefix,
    tier: data.tier,
    rateLimit: data.rateLimit,
    windowSizeSeconds: data.windowSizeSeconds,
    webhookUrl: data.webhookUrl
  });

  return {
    id: created.id,
    apiKey: raw,
    keyPrefix: created.key_prefix,
    tenantId: created.tenant_id,
    name: created.name,
    tier: created.tier,
    rateLimit: created.rate_limit,
    windowSizeSeconds: created.window_size_seconds,
    webhookUrl: created.webhook_url,
    isActive: created.is_active,
    createdAt: created.created_at
  };
}

async function listKeys(tenantId) {
  if (tenantId) {
    return await apiKeyRepository.findByTenantId(tenantId);
  }
  return await apiKeyRepository.findAll();
}

async function updateKey(id, data) {
  const fields = {
    tier: data.tier,
    rate_limit: data.rateLimit,
    window_size_seconds: data.windowSizeSeconds,
    webhook_url: data.webhookUrl,
    is_active: data.isActive
  };
  
  const updated = await apiKeyRepository.update(id, fields);
  if (!updated) {
    const err = new Error('API key not found');
    err.statusCode = 404;
    throw err;
  }
  return {
    id: updated.id,
    tenantId: updated.tenant_id,
    name: updated.name,
    keyPrefix: updated.key_prefix,
    tier: updated.tier,
    rateLimit: updated.rate_limit,
    windowSizeSeconds: updated.window_size_seconds,
    webhookUrl: updated.webhook_url,
    isActive: updated.is_active,
    createdAt: updated.created_at,
    updatedAt: updated.updated_at
  };
}

async function deactivateKey(id) {
  const result = await apiKeyRepository.deactivate(id);
  if (!result) {
    const err = new Error('API key not found');
    err.statusCode = 404;
    throw err;
  }
  return { message: 'API key deactivated' };
}

module.exports = {
  createKey,
  listKeys,
  updateKey,
  deactivateKey
};
