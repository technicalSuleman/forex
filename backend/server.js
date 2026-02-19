// Backend Server for Forex AI Assistant
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import configurations
const { swaggerUi, specs } = require('./config/swagger');
const errorMiddleware = require('./middleware/error');

// Import routes
const newsRoutes = require('./routes/news');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const kycRoutes = require('./routes/kyc');



const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Basic Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Forex AI Assistant Backend API',
    status: 'running',
    docs: `http://localhost:${PORT}/api-docs`
  });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     responses:
 *       200:
 *         description: Server is healthy
 */
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/news', newsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/kyc', kycRoutes);


// Handle 404
app.use((req, res, next) => {
  const error = new Error('Resource not found');
  error.status = 404;
  next(error);
});

// Centralized Error Handling Middleware
app.use(errorMiddleware);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`📝 API Documentation available at http://localhost:${PORT}/api-docs`);
});

module.exports = app;

