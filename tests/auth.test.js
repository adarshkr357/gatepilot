const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');
const hashKey = require('../src/utils/hashKey');

describe('Authentication Middleware', () => {
  it('should reject requests without API key', async () => {
    const res = await request(app).get('/api/proxy/test');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Missing API key');
  });

  it('should reject requests with invalid API key', async () => {
    db.query.mockResolvedValueOnce({ rows: [] }); // key not found

    const res = await request(app)
      .get('/api/proxy/test')
      .set('x-api-key', 'gp_invalid');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid API key');
  });

  it('should reject requests with inactive API key', async () => {
    db.query.mockResolvedValueOnce({ 
      rows: [{ is_active: false }] 
    });

    const res = await request(app)
      .get('/api/proxy/test')
      .set('x-api-key', 'gp_valid');

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('API key inactive');
  });
});
