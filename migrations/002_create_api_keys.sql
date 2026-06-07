CREATE TABLE IF NOT EXISTS api_keys (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  key_prefix VARCHAR(20) NOT NULL,
  tier VARCHAR(50) NOT NULL DEFAULT 'free',
  rate_limit INTEGER NOT NULL DEFAULT 100,
  window_size_seconds INTEGER NOT NULL DEFAULT 3600,
  webhook_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_tenant_id ON api_keys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);
