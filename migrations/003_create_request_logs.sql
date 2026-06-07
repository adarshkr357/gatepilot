CREATE TABLE IF NOT EXISTS request_logs (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(100) NOT NULL,
  api_key_id INTEGER NOT NULL,
  method VARCHAR(10) NOT NULL,
  path TEXT NOT NULL,
  status_code INTEGER,
  latency_ms INTEGER,
  rate_limited BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_request_logs_tenant_id ON request_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_request_logs_created_at ON request_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_request_logs_tenant_created ON request_logs(tenant_id, created_at);
