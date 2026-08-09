const express = require('express');
const {
  getScheduleSettings,
  updateBusinessHours,
  createBlockedTime,
  deleteBlockedTime
} = require('../controllers/scheduleController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', getScheduleSettings);
router.put('/hours', updateBusinessHours);
router.post('/blocked-time', createBlockedTime);
router.delete('/blocked-time/:id', deleteBlockedTime);

module.exports = router;
