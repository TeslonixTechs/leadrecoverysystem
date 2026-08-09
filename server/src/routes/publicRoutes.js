const express = require('express');
const {
  getPublicBusinessInfo,
  classifyService,
  checkAvailability,
  bookAppointment
} = require('../controllers/publicController');

const router = express.Router();

router.get('/business-info', getPublicBusinessInfo);
router.post('/classify', classifyService);
router.get('/availability', checkAvailability);
router.post('/book', bookAppointment);

module.exports = router;
