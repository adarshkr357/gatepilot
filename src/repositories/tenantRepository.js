const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

async function create({ id, name, tier }) {
  const tenantId = id || `tenant_${uuidv4().split('-')[0]}`;
  const t = tier || 'free';
  const result = await query(
    `INSERT INTO tenants (id, name, tier) VALUES ($1, $2, $3) RETURNING *`,
    [tenantId, name, t]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await query(`SELECT * FROM tenants WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

async function findAll() {
  const result = await query(`SELECT * FROM tenants ORDER BY created_at DESC`);
  return result.rows;
}

module.exports = {
  create,
  findById,
  findAll
};
