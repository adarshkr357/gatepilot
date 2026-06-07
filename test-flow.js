const axios = require('axios');

async function testFlow() {
  try {
    console.log('1. Creating Tenant...');
    const tenantRes = await axios.post('http://localhost:3000/api/tenants', 
      { name: 'Acme Corp', tier: 'premium' },
      { headers: { 'x-admin-token': 'dev_admin_token' } }
    );
    const tenantId = tenantRes.data.id;
    console.log('Tenant Created:', tenantId);

    console.log('\n2. Creating API Key...');
    const keyRes = await axios.post('http://localhost:3000/api/keys', 
      { tenantId, name: 'Prod Key', rateLimit: 5, windowSizeSeconds: 60 },
      { headers: { 'x-admin-token': 'dev_admin_token' } }
    );
    const apiKey = keyRes.data.apiKey;
    console.log('API Key Created:', apiKey);

    console.log('\n3. Making Proxy Requests (Limit is 5)...');
    for (let i = 1; i <= 6; i++) {
      try {
        const proxyRes = await axios.get('http://localhost:3000/api/proxy/products', {
          headers: { 'x-api-key': apiKey }
        });
        console.log(`Request ${i}: Success (${proxyRes.status}) - ${proxyRes.data.length} products returned`);
      } catch (err) {
        if (err.response && err.response.status === 429) {
          console.log(`Request ${i}: Blocked by Rate Limiter (429 Too Many Requests)`);
        } else {
          console.log(`Request ${i}: Failed -`, err.message);
        }
      }
    }

    // Wait a second for async logging to finish
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n4. Fetching Analytics...');
    const analyticsRes = await axios.get(`http://localhost:3000/api/analytics/${tenantId}`, {
      headers: { 'x-admin-token': 'dev_admin_token' }
    });
    console.log('Analytics Data:');
    console.log(JSON.stringify(analyticsRes.data, null, 2));

  } catch (error) {
    console.error('Test script failed:', error.response ? error.response.data : error.message);
  }
}

testFlow();
