const express = require('express');
const {
  getAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment
} = require('../controllers/appointmentController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.put('/:id', updateAppointment);
router.delete('/:id', cancelAppointment);

module.exports = router;
