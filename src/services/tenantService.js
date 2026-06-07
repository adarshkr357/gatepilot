const tenantRepository = require('../repositories/tenantRepository');
const { v4: uuidv4 } = require('uuid');

async function createTenant(data) {
  const id = data.id || `tenant_${uuidv4().split('-')[0]}`;
  const tenant = await tenantRepository.create({ ...data, id });
  return tenant;
}

async function getTenant(id) {
  const tenant = await tenantRepository.findById(id);
  if (!tenant) {
    const error = new Error('Tenant not found');
    error.statusCode = 404;
    throw error;
  }
  return tenant;
}

async function listTenants() {
  return await tenantRepository.findAll();
}

module.exports = {
  createTenant,
  getTenant,
  listTenants
};
