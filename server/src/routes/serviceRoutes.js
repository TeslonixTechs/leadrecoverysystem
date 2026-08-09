const express = require('express');
const { getServices, createService, updateService, deleteService } = require('../controllers/serviceController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', getServices);
router.post('/', createService);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

module.exports = router;
