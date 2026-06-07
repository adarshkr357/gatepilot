const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');
const axios = require('axios');

jest.mock('axios');

describe('Proxy Service', () => {
  beforeEach(() => {
    db.query.mockResolvedValue({
      rows: [{
        id: 1,
        tenant_id: 't1',
        name: 'test',
        is_active: true,
        rate_limit: 100,
        window_size_seconds: 60
      }]
    });
  });

  it('should forward request to target', async () => {
    axios.mockResolvedValueOnce({
      status: 200,
      headers: { 'content-type': 'application/json' },
      data: {
        pipe: jest.fn(res => {
          res.end(JSON.stringify({ mock: 'data' }));
        })
      }
    });

    const res = await request(app)
      .get('/api/proxy/products')
      .set('x-api-key', 'gp_valid');

    expect(res.status).toBe(200);
    expect(res.body.mock).toBe('data');
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      url: 'http://localhost:4000/products',
      method: 'GET'
    }));
  });

  it('should handle timeout from target', async () => {
    const timeoutError = new Error('timeout');
    timeoutError.code = 'ECONNABORTED';
    axios.mockRejectedValueOnce(timeoutError);

    const res = await request(app)
      .get('/api/proxy/products')
      .set('x-api-key', 'gp_valid');

    expect(res.status).toBe(504);
    expect(res.body.error).toBe('Gateway Timeout');
  });
});
