const redis = require('../config/redis');
const { randomUUID } = require('crypto');

async function checkRateLimit(apiKeyId, limit, windowSeconds) {
  const key = `rate:${apiKeyId}`;
  const now = Date.now();
  const windowStart = now - (windowSeconds * 1000);

  // 1. Remove expired entries
  await redis.zremrangebyscore(key, 0, windowStart);

  // 2. Count current entries
  const currentCount = await redis.zcard(key);

  // 3. Check if under limit
  if (currentCount >= limit) {
    const oldestEntries = await redis.zrange(key, 0, 0, 'WITHSCORES');
    const resetTime = oldestEntries.length >= 2 
      ? parseInt(oldestEntries[1]) + (windowSeconds * 1000)
      : now + (windowSeconds * 1000);
    return { allowed: false, limit, remaining: 0, resetTime: Math.ceil(resetTime / 1000) };
  }

  // 4. Add current request with UNIQUE member
  const member = `${now}:${randomUUID()}`;
  await redis.zadd(key, now, member);

  // 5. Set TTL on the key
  await redis.expire(key, windowSeconds);

  // 6. Calculate remaining
  const remaining = Math.max(0, limit - currentCount - 1);
  const resetTime = Math.ceil((now + windowSeconds * 1000) / 1000);

  return { allowed: true, limit, remaining, resetTime };
}

module.exports = { checkRateLimit };
