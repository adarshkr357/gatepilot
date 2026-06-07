const axios = require('axios');

const BASE_URL = 'https://gatepilot-app-458fb57eb8a6.herokuapp.com';
const ADMIN_TOKEN = 'Zeltrax';

async function runTests() {
  console.log('Starting Live Tests on Heroku...');
  try {
    // 1. Health check
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check Passed:', health.data);

    // 2. Create Tenant
    const tenantRes = await axios.post(`${BASE_URL}/api/tenants`, {
      name: 'Test Tenant',
      tier: 'premium'
    }, {
      headers: { 'x-admin-token': ADMIN_TOKEN }
    });
    const tenantId = tenantRes.data.id;
    console.log('✅ Tenant Created:', tenantId);

    // 3. Create API Key
    const keyRes = await axios.post(`${BASE_URL}/api/keys`, {
      tenantId: tenantId,
      name: 'Live Test Key',
      rateLimit: 5,
      windowSizeSeconds: 60
    }, {
      headers: { 'x-admin-token': ADMIN_TOKEN }
    });
    const apiKey = keyRes.data.apiKey;
    console.log('✅ API Key Created:', apiKey);

    // 4. Test Proxy
    // Since target is jsonplaceholder, /api/proxy/todos/1 should work
    const proxyRes = await axios.get(`${BASE_URL}/api/proxy/todos/1`, {
      headers: { 'x-api-key': apiKey }
    });
    console.log('✅ Proxy Request Passed, Target Responded:', proxyRes.data.title);
    console.log('   Rate Limit Headers:', {
      limit: proxyRes.headers['x-ratelimit-limit'],
      remaining: proxyRes.headers['x-ratelimit-remaining']
    });

    // 5. Test Analytics
    // Wait a brief moment for async logging
    await new Promise(r => setTimeout(r, 1000));
    const analyticsRes = await axios.get(`${BASE_URL}/api/analytics/${tenantId}`, {
      headers: { 'x-admin-token': ADMIN_TOKEN }
    });
    console.log('✅ Analytics Retrieved:', analyticsRes.data);

    console.log('\\n🎉 All Live Tests Passed Successfully!');
  } catch (error) {
    console.error('❌ Test Failed:', error.response ? error.response.data : error.message);
  }
}

runTests();
