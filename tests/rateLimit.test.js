const { checkRateLimit } = require('../src/services/rateLimitService');
const redis = require('../src/config/redis');

describe('Rate Limit Service', () => {
  beforeEach(async () => {
    await redis.flushall();
  });

  it('should allow requests within limit', async () => {
    const result = await checkRateLimit(1, 10, 60);
    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(10);
    expect(result.remaining).toBe(9);
  });

  it('should block requests over limit', async () => {
    // Fill quota
    for (let i = 0; i < 5; i++) {
      await checkRateLimit(2, 5, 60);
    }

    const result = await checkRateLimit(2, 5, 60);
    expect(result.allowed).toBe(false);
    expect(result.limit).toBe(5);
    expect(result.remaining).toBe(0);
  });
});
