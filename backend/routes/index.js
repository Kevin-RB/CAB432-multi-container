import express from 'express';
import uploadRoutes from './upload.js';

const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
    console.log('Health check endpoint hit');
    res.json({
        message: 'File Upload API is running!',
        endpoints: {
            upload: 'POST /upload - Upload an image or PDF file'
        }
    });
});

// Mount upload routes
router.use('/', uploadRoutes);

export default router;
