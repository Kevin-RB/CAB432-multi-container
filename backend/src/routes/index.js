import express from 'express';
import uploadRoutes from './upload.js';
import axios from 'axios';

const router = express.Router();

// Health check endpoint
router.get('/', async (req, res) => {
    console.log('Health check endpoint hit');
    try {
        // Make a GET request to the tesseract container
        const tesseractResponse = await axios.get('http://tesseract:3001/health');
        console.log('Tesseract service response:', tesseractResponse.data);

        res.json({
            message: 'File Upload API is running!',
            tesseract_status: 'Connected',
            tesseract_response: tesseractResponse.data,
            endpoints: {
                upload: 'POST /upload - Upload an image or PDF file'
            }
        });
    } catch (error) {
        console.error('Failed to connect to tesseract service:', error.message);

        res.json({
            message: 'File Upload API is running!',
            tesseract_status: 'Disconnected',
            tesseract_error: error.message,
            endpoints: {
                upload: 'POST /upload - Upload an image or PDF file'
            }
        });
    }
});

// Mount upload routes
router.use('/', uploadRoutes);

export default router;
