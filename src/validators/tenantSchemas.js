const { z } = require('zod');

const createTenantSchema = z.object({
  id: z.string().min(1).max(100).optional(),
  name: z.string().min(1).max(255),
  tier: z.string().optional().default('free')
});

module.exports = {
  createTenantSchema
};
