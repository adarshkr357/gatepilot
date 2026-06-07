const apiKeyService = require('../services/apiKeyService');
const asyncHandler = require('../utils/asyncHandler');

const create = asyncHandler(async (req, res) => {
  const key = await apiKeyService.createKey(req.body);
  res.status(201).json(key);
});

const list = asyncHandler(async (req, res) => {
  const keys = await apiKeyService.listKeys(req.query.tenantId);
  res.status(200).json(keys);
});

const update = asyncHandler(async (req, res) => {
  const key = await apiKeyService.updateKey(req.params.id, req.body);
  res.status(200).json(key);
});

const deactivate = asyncHandler(async (req, res) => {
  const result = await apiKeyService.deactivateKey(req.params.id);
  res.status(200).json(result);
});

module.exports = {
  create,
  list,
  update,
  deactivate
};
