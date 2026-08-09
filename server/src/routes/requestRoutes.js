const express = require('express');
const { getServiceRequests, getServiceRequestById } = require('../controllers/requestController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', getServiceRequests);
router.get('/:id', getServiceRequestById);

module.exports = router;
