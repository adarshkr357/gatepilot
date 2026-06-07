# GatePilot

**Rate-Limited API Gateway with Multi-Tenant Quotas**

## Overview
GatePilot is a reverse-proxy API gateway that authenticates client requests using API keys, enforces tenant-specific rate limits with Redis, logs request activity to PostgreSQL, sends webhook alerts for quota violations, and exposes analytics APIs for usage monitoring.

## Features
- API key authentication with SHA-256 hashing
- Multi-tenant support with tenant-specific quotas
- Redis-backed sliding window rate limiting
- Reverse proxy with header sanitization and timeout handling
- Asynchronous request logging to PostgreSQL
- Analytics API with 24-hour usage metrics
- BullMQ webhook alerts for quota violations
- Admin API protected by admin token
- Fully containerized with Docker Compose
- Mock backend service for testing

## Tech Stack
| Technology | Purpose |
| --- | --- |
| Node.js + Express | API Server |
| PostgreSQL | Persistent storage |
| Redis | Rate limiting (sliding window) |
| BullMQ | Webhook job queue |
| Axios | HTTP proxy forwarding |
| Zod | Request validation |
| Winston | Structured logging |
| Docker | Containerization |
| Jest + Supertest | Testing |

## Architecture
```mermaid
graph TB
    Client[Client] -->|X-API-Key| Gateway[GatePilot Gateway]
    Gateway --> AuthMW[Auth Middleware]
    AuthMW --> LogMW[Request Logger]
    LogMW --> RateMW[Rate Limiter]
    RateMW --> Proxy[Reverse Proxy]
    Proxy -->|Forward| Target[Mock Service]

    AuthMW -->|Hash Lookup| PG[(PostgreSQL)]
    RateMW -->|Sliding Window| Redis[(Redis)]
    LogMW -->|Async Insert| PG
    RateMW -->|Quota Exceeded| BullMQ[BullMQ Queue]
    BullMQ --> Worker[Webhook Worker]
    Worker -->|POST| WebhookURL[Tenant Webhook]

    AdminAPI[Admin APIs] --> PG
    Analytics[Analytics API] --> PG
```

## Middleware Pipeline
```
Client Request
  → Authentication (X-API-Key hash lookup)
  → Request Logger (captures timing on res.finish)
  → Rate Limiter (Redis sliding window check)
  → Reverse Proxy (forward to target service)
  → Response to Client
```

## Quick Start

### Docker (Recommended)
```bash
git clone https://github.com/adarshkr357/gatepilot.git
cd gatepilot
docker compose up -d
```

### Local Development
```bash
npm install
# Start PostgreSQL and Redis locally
npm run migrate
npm run dev
# In another terminal:
npm run worker
# In another terminal:
cd mock-service && npm install && npm start
```

## Environment Variables
| Variable | Default | Description |
| --- | --- | --- |
| PORT | 3000 | Port for the API Gateway |
| NODE_ENV | development | Environment |
| DATABASE_URL | postgresql://gatepilot:gatepilot@localhost:5432/gatepilot | Postgres connection string |
| REDIS_URL | redis://localhost:6379 | Redis connection string |
| TARGET_BASE_URL | http://mock-service:4000 | Base URL for proxied requests |
| ADMIN_TOKEN | dev_admin_token | Token required for Admin API |

## API Reference

### Admin Endpoints
All admin endpoints require the `x-admin-token` header.

#### Create Tenant
```http
POST /api/tenants
```
Request Body:
```json
{
  "name": "Acme Corp",
  "tier": "premium"
}
```

#### List Tenants
```http
GET /api/tenants
```

#### Get Tenant
```http
GET /api/tenants/:id
```

#### Create API Key
```http
POST /api/keys
```
Request Body:
```json
{
  "tenantId": "tenant_123",
  "name": "Prod Key",
  "rateLimit": 1000,
  "windowSizeSeconds": 3600,
  "webhookUrl": "https://example.com/webhook"
}
```

#### List API Keys
```http
GET /api/keys?tenantId=tenant_123
```

#### Update API Key
```http
PATCH /api/keys/:id
```

#### Deactivate API Key
```http
DELETE /api/keys/:id
```

#### Get Analytics
```http
GET /api/analytics/:tenantId
```
Response:
```json
{
  "totalRequests": 1500,
  "blockedRequests": 50,
  "avgLatency": 45.2,
  "uniqueEndpoints": 12,
  "topEndpoints": [
    { "path": "/products", "count": 1000 }
  ],
  "statusCodeBreakdown": [
    { "statusCode": 200, "count": 1400 },
    { "statusCode": 429, "count": 50 }
  ]
}
```

### Gateway Endpoint

#### Reverse Proxy
All requests to `/api/proxy/*` are forwarded.
Requires `x-api-key` header.
```http
GET /api/proxy/products
x-api-key: gp_abc123...
```

## Rate Limiting
GatePilot uses a sliding window algorithm implemented via Redis sorted sets.
- Each request adds a unique timestamped entry.
- Old entries outside the window are removed.
- The count of remaining entries determines if the request is allowed.
- Headers returned: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

*Future Improvement: Use Redis Lua script for atomic check-and-increment under high concurrency.*

## Security
- API keys hashed with SHA-256 before storage
- Raw key shown only once at creation
- Admin routes require separate admin token
- Helmet.js for secure HTTP headers
- CORS enabled
- Request size limited to 10KB
- Parameterized SQL queries (no string concatenation)
- Unauthenticated requests rejected before tenant resolution

## Deployment
For deploying to a VPS:
```bash
git clone https://github.com/adarshkr357/gatepilot.git
cp .env.example .env
# Edit .env with real values
docker compose up -d
```

## Database Schema
```sql
CREATE TABLE tenants (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  tier VARCHAR(50) NOT NULL DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE api_keys (
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

CREATE TABLE request_logs (
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
```

## Future Improvements
- Redis Lua script for atomic rate limiting
- Dead-letter queue for failed webhooks
- OpenAPI/Swagger documentation
- React dashboard for API usage visualization
- Token bucket rate limiter as alternative algorithm
- Key rotation
- Per-route rate limiting
- Prometheus metrics + Grafana dashboards
- Kubernetes deployment manifests

## Interview Talking Points
- **Hashing API Keys**: Essential for security; if the DB is compromised, plaintext keys are not exposed.
- **Redis for Rate Limiting**: Extremely fast, supports atomic operations, and has built-in TTL mechanisms.
- **Sliding vs Fixed Window**: Sliding window provides a smoother distribution and prevents burst anomalies at window boundaries.
- **Async Request Logging**: Ensures logging overhead doesn't impact gateway latency (fire-and-forget).
- **BullMQ for Webhooks**: Background processing is crucial so that webhook delivery doesn't delay HTTP responses. Offers retries out-of-the-box.
- **Header Sanitization**: Critical in reverse proxies to strip hop-by-hop headers and enforce protocol compliance and security.
