const analyticsService = require('../services/analyticsService');
const asyncHandler = require('../utils/asyncHandler');

const getAnalytics = asyncHandler(async (req, res) => {
  const { tenantId } = req.params;
  const analytics = await analyticsService.getAnalytics(tenantId);
  res.json(analytics);
});

module.exports = { getAnalytics };
