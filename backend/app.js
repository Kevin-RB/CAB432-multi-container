import express from 'express';
import { handleUploadError } from './middleware/upload.js';
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/', routes);

// Error handling middleware for multer
app.use(handleUploadError);

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📁 Upload endpoint: POST http://localhost:${PORT}/upload`);
});
