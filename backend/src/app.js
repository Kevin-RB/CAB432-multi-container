import express from 'express';
import healthRoutes from './routes/v1/health.js';
import uploadRoutes from './routes/v1/upload.js';
import receiptsRoutes from './routes/v1/receipts.js';
import videosRoutes from './routes/v1/videos.js';
import { authenticateToken, verifyAdmin } from './middleware/auth.js';
import authRoutes from './routes/v1/auth.js';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3001',        // Development
    'https://cosmic.cab432.com'     // Production frontend
  ],
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Public health check endpoint (no authentication)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'cosmic-receipt-backend'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Cosmic Receipt API',
    version: 'v1',
    endpoints: {
      health: '/health',
      api: '/api/v1'
    }
  });
});

// auth
app.use('/api/v1/auth', authRoutes)

// V1 routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/upload', authenticateToken, verifyAdmin, uploadRoutes);
app.use('/api/v1/receipts', authenticateToken, receiptsRoutes);
app.use('/api/v1/videos', authenticateToken, videosRoutes);

// 404 handler - must come after all other routes
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.url,
    method: req.method
  });
});

// Error handling middleware - must come last
app.use((err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error',
    path: req.url
  });
});

// Start the server
app.listen(process.env.PORT || 3000, () => {
  console.log(`🚀 Server is running on http://localhost:${process.env.PORT || 3000}`);
});
