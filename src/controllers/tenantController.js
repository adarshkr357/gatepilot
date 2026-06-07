const tenantService = require('../services/tenantService');
const asyncHandler = require('../utils/asyncHandler');

const create = asyncHandler(async (req, res) => {
  const tenant = await tenantService.createTenant(req.body);
  res.status(201).json(tenant);
});

const list = asyncHandler(async (req, res) => {
  const tenants = await tenantService.listTenants();
  res.status(200).json(tenants);
});

const getById = asyncHandler(async (req, res) => {
  const tenant = await tenantService.getTenant(req.params.id);
  res.status(200).json(tenant);
});

module.exports = {
  create,
  list,
  getById
};
