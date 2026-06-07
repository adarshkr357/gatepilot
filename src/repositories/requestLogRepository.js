const { query } = require('../config/db');

async function create({ tenantId, apiKeyId, method, path, statusCode, latencyMs, rateLimited, errorMessage }) {
  const result = await query(
    `INSERT INTO request_logs (tenant_id, api_key_id, method, path, status_code, latency_ms, rate_limited, error_message)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [tenantId, apiKeyId, method, path, statusCode, latencyMs, rateLimited || false, errorMessage || null]
  );
  return result.rows[0];
}

async function getAnalytics(tenantId, since) {
  const params = [tenantId, since];
  
  const summaryQuery = `
    SELECT 
      COUNT(*)::int as total_requests,
      COUNT(*) FILTER (WHERE rate_limited = true)::int as blocked_requests,
      ROUND(AVG(latency_ms)::numeric, 2)::float as avg_latency,
      COUNT(DISTINCT path)::int as unique_endpoints
    FROM request_logs
    WHERE tenant_id = $1 AND created_at >= $2
  `;
  
  const topEndpointsQuery = `
    SELECT path, COUNT(*)::int as count
    FROM request_logs
    WHERE tenant_id = $1 AND created_at >= $2
    GROUP BY path
    ORDER BY count DESC
    LIMIT 10
  `;
  
  const statusBreakdownQuery = `
    SELECT status_code as "statusCode", COUNT(*)::int as count
    FROM request_logs
    WHERE tenant_id = $1 AND created_at >= $2
    GROUP BY status_code
    ORDER BY count DESC
  `;
  
  const [summary, topEndpoints, statusBreakdown] = await Promise.all([
    query(summaryQuery, params),
    query(topEndpointsQuery, params),
    query(statusBreakdownQuery, params)
  ]);
  
  const s = summary.rows[0];
  return {
    totalRequests: s.total_requests || 0,
    blockedRequests: s.blocked_requests || 0,
    avgLatency: s.avg_latency || 0,
    uniqueEndpoints: s.unique_endpoints || 0,
    topEndpoints: topEndpoints.rows,
    statusCodeBreakdown: statusBreakdown.rows
  };
}

module.exports = { create, getAnalytics };
