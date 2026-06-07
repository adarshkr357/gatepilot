const express = require('express');
const router = express.Router();
const { authenticateApiKey } = require('../middleware/authenticateApiKey');
const { rateLimiter } = require('../middleware/rateLimiter');
const proxyController = require('../controllers/proxyController');

let requestLogger;
try {
  requestLogger = require('../middleware/requestLogger').requestLogger;
} catch(e) {
  requestLogger = (req, res, next) => next();
}

router.all('/*', authenticateApiKey, requestLogger, rateLimiter, proxyController.forward);

module.exports = router;
