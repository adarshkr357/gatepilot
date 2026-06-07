const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const { validateRequest } = require('../middleware/validateRequest');
const { createTenantSchema } = require('../validators/tenantSchemas');

router.post('/', validateRequest(createTenantSchema), tenantController.create);
router.get('/', tenantController.list);
router.get('/:id', tenantController.getById);

module.exports = router;
