const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');

describe('API Keys endpoints', () => {
  beforeEach(() => {
    db.query.mockReset();
  });

  const adminToken = process.env.ADMIN_TOKEN || 'dev_admin_token';

  it('should create an API key', async () => {
    db.query.mockResolvedValueOnce({
      rows: [{
        id: 1,
        tenant_id: 'tenant_123',
        name: 'Test Key',
        key_prefix: 'gp_abc12',
        tier: 'free',
        rate_limit: 100,
        window_size_seconds: 3600,
        webhook_url: null,
        is_active: true,
        created_at: new Date()
      }]
    });

    const res = await request(app)
      .post('/api/keys')
      .set('x-admin-token', adminToken)
      .send({
        tenantId: 'tenant_123',
        name: 'Test Key'
      });

    expect(res.status).toBe(201);
    expect(res.body.apiKey).toMatch(/^gp_[a-f0-9]{64}$/);
    expect(res.body.tenantId).toBe('tenant_123');
  });

  it('should list API keys', async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: 1, tenant_id: 'tenant_123', name: 'Test Key' }]
    });

    const res = await request(app)
      .get('/api/keys')
      .set('x-admin-token', adminToken);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Test Key');
  });
});
