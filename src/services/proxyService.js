const axios = require('axios');
const logger = require('../utils/logger');

async function forward(req, res) {
  const targetPath = req.originalUrl.replace('/api/proxy', '') || '/';
  const targetUrl = `${process.env.TARGET_BASE_URL}${targetPath}`;

  const headers = { ...req.headers };
  const headersToRemove = [
    'host', 'connection', 'x-api-key', 'x-admin-token',
    'keep-alive', 'transfer-encoding', 'te', 'trailer', 'upgrade',
    'proxy-authorization', 'proxy-authenticate'
  ];
  
  if (['GET', 'HEAD'].includes(req.method.toUpperCase())) {
    delete headers['content-length'];
  }

  headersToRemove.forEach(h => delete headers[h]);

  try {
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      params: req.query,
      headers: headers,
      timeout: 10000,
      responseType: 'stream',
      validateStatus: () => true
    });

    res.status(response.status);
    Object.entries(response.headers).forEach(([key, value]) => {
      // Do not let backend overwrite Gateway's rate limit headers
      if (!key.toLowerCase().startsWith('x-ratelimit-')) {
        res.setHeader(key, value);
      }
    });

    response.data.pipe(res);
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Gateway Timeout' });
    }
    
    logger.error('Proxy forward error', { error: error.message });
    return res.status(502).json({ error: 'Bad Gateway' });
  }
}

module.exports = { forward };
