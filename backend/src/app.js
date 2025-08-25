import express from 'express';
import healthRoutes from './routes/v1/health.js';
import uploadRoutes from './routes/v1/upload.js';
import receiptsRoutes from './routes/v1/receipts.js';
import ollamaRoutes from './routes/v1/ollama-routes.js';
import config from './config/index.js';
import { handleUploadError } from './services/multer.js';

const app = express();

// Middleware
app.use(express.json());

// V1 routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/receipt', receiptsRoutes);
app.use('/api/v1/ollama', ollamaRoutes);

// Error handling middleware for multer
app.use(handleUploadError);

// Start the server
app.listen(config.port, () => {
  console.log(`🚀 Server is running on http://localhost:${config.port}`);
  console.log(`📁 Upload endpoint: POST http://localhost:${config.port}/api/v1/upload`);
  console.log(`📈 Receipts endpoint: GET http://localhost:${config.port}/api/v1/receipts`);
  console.log(`❤️ Health check: GET http://localhost:${config.port}/api/v1/health`);
});
