import express from 'express';
import { upload } from '../middleware/upload.js';

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

        // Here you can process the file if needed
        // The file content is available in req.file.buffer
        console.log(`File received: ${file.originalname} (${fileInfo.sizeInMB} MB)`);

        // Send to Tesseract OCR service
        const formData = new FormData();
        formData.append('image', new Blob([file.buffer]), file.originalname);

        const ocrResponse = await fetch('http://tesseract-service:3001/ocr', {
            method: 'POST',
            body: formData
        });

        if (!ocrResponse.ok) {
            throw new Error(`OCR service error: ${ocrResponse.statusText}`);
        }

        const ocrResult = await ocrResponse.json();

        // Return combined response
        res.json({
            success: true,
            message: 'File uploaded and OCR processed successfully',
            fileInfo,
            ocrResult
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
