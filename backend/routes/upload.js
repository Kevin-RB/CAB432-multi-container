import express from 'express';
import { upload } from '../middleware/upload.js';
import axios from 'axios';

const router = express.Router();

// File upload endpoint
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                error: 'No file uploaded',
                message: 'Please select a file to upload'
            });
        }

        const file = req.file;

        // File information (without storing it)
        const fileInfo = {
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            sizeInMB: (file.size / (1024 * 1024)).toFixed(2),
            uploadTime: new Date().toISOString()
        };

        // Send to Tesseract OCR service
        const formData = new FormData();
        formData.append('image', new Blob([file.buffer]), file.originalname);

        const ocrResponse = await axios.post('http://tesseract:3001/ocr', formData);

        if (ocrResponse.statusText !== 'OK') {
            throw new Error(`OCR service error: ${ocrResponse.statusText}`);
        }

        res.json({
            success: true,
            message: 'File uploaded and OCR processed successfully',
            fileInfo: fileInfo,
            ocrResult: ocrResponse.data,
        });

    } catch (error) {
        console.error('Upload/OCR error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to process file upload or OCR'
        });
    }
});

export default router;
