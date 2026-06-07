const { query } = require('../config/db');

async function create({ tenantId, name, keyHash, keyPrefix, tier, rateLimit, windowSizeSeconds, webhookUrl }) {
  const result = await query(
    `INSERT INTO api_keys (tenant_id, name, key_hash, key_prefix, tier, rate_limit, window_size_seconds, webhook_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [tenantId, name, keyHash, keyPrefix, tier || 'free', rateLimit, windowSizeSeconds, webhookUrl || null]
  );
  return result.rows[0];
}

async function findByHash(hash) {
  const result = await query(`SELECT * FROM api_keys WHERE key_hash = $1`, [hash]);
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await query(`SELECT * FROM api_keys WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

async function findByTenantId(tenantId) {
  const result = await query(
    `SELECT id, tenant_id, name, key_prefix, tier, rate_limit, window_size_seconds, webhook_url, is_active, created_at
     FROM api_keys WHERE tenant_id = $1 ORDER BY created_at DESC`,
    [tenantId]
  );
  return result.rows;
}

async function findAll() {
  const result = await query(
    `SELECT id, tenant_id, name, key_prefix, tier, rate_limit, window_size_seconds, webhook_url, is_active, created_at
     FROM api_keys ORDER BY created_at DESC`
  );
  return result.rows;
}

async function update(id, fields) {
  const setClauses = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      setClauses.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  }

  if (setClauses.length === 0) {
    return findById(id);
  }

  setClauses.push(`updated_at = NOW()`);
  values.push(id);

  const sql = `UPDATE api_keys SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await query(sql, values);
  return result.rows[0] || null;
}

async function deactivate(id) {
  const result = await query(
    `UPDATE api_keys SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  create,
  findByHash,
  findById,
  findByTenantId,
  findAll,
  update,
  deactivate
};
