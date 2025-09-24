import express from 'express';
import healthRoutes from './routes/v1/health.js';
import uploadRoutes from './routes/v1/upload.js';
import receiptsRoutes from './routes/v1/receipts.js';
import ollamaRoutes from './routes/v1/ollama-routes.js';
import videosRoutes from './routes/v1/videos.js';
import config from './config/index.js';
import { authenticateToken, verifyAdmin } from './middleware/auth.js';
import authRoutes from './routes/v1/auth.js';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

// Middleware
app.use(express.json());

// auth
app.use('/api/v1/auth', authRoutes)

// V1 routes
app.use('/api/v1/health', authenticateToken, verifyAdmin, healthRoutes);
app.use('/api/v1/upload', authenticateToken, verifyAdmin, uploadRoutes);
app.use('/api/v1/receipts', authenticateToken, receiptsRoutes);
app.use('/api/v1/ollama', authenticateToken, verifyAdmin, ollamaRoutes);
app.use('/api/v1/videos', authenticateToken, videosRoutes);

// Start the server
app.listen(config.port, () => {
  console.log(`🚀 Server is running on http://localhost:${config.port}`);
});
