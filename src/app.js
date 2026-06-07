const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { authenticateAdmin } = require('./middleware/authenticateAdmin');
const errorHandler = require('./middleware/errorHandler');
const tenantRoutes = require('./routes/tenants');
const apiKeyRoutes = require('./routes/apiKeys');

const analyticsRoutes = require('./routes/analytics');
const proxyRoutes = require('./routes/proxy');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/tenants', authenticateAdmin, tenantRoutes);
app.use('/api/keys', authenticateAdmin, apiKeyRoutes);
app.use('/api/analytics', authenticateAdmin, analyticsRoutes);

app.use('/api/proxy', proxyRoutes);

app.use(errorHandler);

module.exports = app;
