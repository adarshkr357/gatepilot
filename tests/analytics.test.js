const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');

describe('Analytics Endpoint', () => {
  const adminToken = process.env.ADMIN_TOKEN || 'dev_admin_token';

  it('should return analytics for a tenant', async () => {
    db.query.mockResolvedValueOnce({
      rows: [{
        total_requests: 150,
        blocked_requests: 10,
        avg_latency: 45.5,
        unique_endpoints: 3
      }]
    });
    db.query.mockResolvedValueOnce({ rows: [] }); // top endpoints
    db.query.mockResolvedValueOnce({ rows: [] }); // status breakdown

    const res = await request(app)
      .get('/api/analytics/tenant_123')
      .set('x-admin-token', adminToken);

    expect(res.status).toBe(200);
    expect(res.body.totalRequests).toBe(150);
    expect(res.body.blockedRequests).toBe(10);
    expect(res.body.avgLatency).toBe(45.5);
  });
});
