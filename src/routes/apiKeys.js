const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKeyController');
const { validateRequest } = require('../middleware/validateRequest');
const { createApiKeySchema, updateApiKeySchema } = require('../validators/apiKeySchemas');

router.post('/', validateRequest(createApiKeySchema), apiKeyController.create);
router.get('/', apiKeyController.list);
router.patch('/:id', validateRequest(updateApiKeySchema), apiKeyController.update);
router.delete('/:id', apiKeyController.deactivate);

module.exports = router;
