const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const businessRoutes = require('./routes/businessRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const publicRoutes = require('./routes/publicRoutes');
const requestRoutes = require('./routes/requestRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ServiceFlow API Server', timestamp: new Date().toISOString() });
});

// REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/service-requests', requestRoutes);
app.use('/api/appointments', appointmentRoutes);

// Centralized Error Handling
app.use(errorHandler);

module.exports = app;
