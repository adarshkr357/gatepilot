const crypto = require('crypto');
const hashKey = require('./hashKey');

function generateApiKey() {
  const randomHex = crypto.randomBytes(32).toString('hex');
  const raw = `gp_${randomHex}`;
  const hash = hashKey(raw);
  const prefix = raw.substring(0, 8); // 'gp_' + 5 hex chars
  
  return { raw, hash, prefix };
}

module.exports = generateApiKey;
