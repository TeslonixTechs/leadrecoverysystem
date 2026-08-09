const express = require('express');
const { getBusiness, updateBusiness } = require('../controllers/businessController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', getBusiness);
router.put('/', updateBusiness);

module.exports = router;
