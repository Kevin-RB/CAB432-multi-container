import express from 'express';
import { handleUploadError } from './middleware/upload.js';
import healthRoutes from './routes/v1/health.js';
import uploadRoutes from './routes/v1/upload.js';
import ollamaRoutes from './routes/v1/ollama-routes.js';
import config from './config/index.js';

const app = express();

// Middleware
app.use(express.json());

// V1 routes
app.use('/v1/health', healthRoutes);
app.use('/v1/upload', uploadRoutes);
app.use('/v1/ollama', ollamaRoutes);

// Error handling middleware for multer
app.use(handleUploadError);

// Start the server
app.listen(config.port, () => {
  console.log(`🚀 Server is running on http://localhost:${config.port}`);
  console.log(`📁 Upload endpoint: POST http://localhost:${config.port}/upload`);
  console.log(`🔍 Health check: GET http://localhost:${config.port}/`);
});
