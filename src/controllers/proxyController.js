const proxyService = require('../services/proxyService');

const forward = async (req, res, next) => {
  try {
    await proxyService.forward(req, res);
  } catch (error) {
    next(error);
  }
};

module.exports = { forward };
