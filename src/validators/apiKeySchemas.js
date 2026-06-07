const { z } = require('zod');

const createApiKeySchema = z.object({
  tenantId: z.string().min(1),
  name: z.string().min(1).max(255),
  rateLimit: z.number().int().positive().optional().default(100),
  windowSizeSeconds: z.number().int().positive().optional().default(3600),
  webhookUrl: z.string().url().optional().or(z.literal('')).nullable()
});

const updateApiKeySchema = z.object({
  tier: z.string().optional(),
  rateLimit: z.number().int().positive().optional(),
  windowSizeSeconds: z.number().int().positive().optional(),
  webhookUrl: z.string().url().optional().or(z.literal('')).nullable(),
  isActive: z.boolean().optional()
});

module.exports = {
  createApiKeySchema,
  updateApiKeySchema
};
