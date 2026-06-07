require('dotenv').config();
process.env.ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'dev_admin_token';
process.env.TARGET_BASE_URL = process.env.TARGET_BASE_URL || 'http://localhost:4000';

// We mock the DB and Redis for basic unit/integration tests to avoid needing a real DB
jest.mock('../src/config/db', () => ({
  pool: {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
  },
  query: jest.fn()
}));

jest.mock('../src/config/redis', () => {
  const ioredisMock = require('ioredis-mock');
  return new ioredisMock();
});

jest.mock('../src/config/queue', () => ({
  webhookQueue: {
    add: jest.fn()
  },
  queueConnection: {}
}));
