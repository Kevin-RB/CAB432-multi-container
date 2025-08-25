import axios from 'axios';
import { extractReceiptInfo } from '../../services/ollama.js';
import config from '../../config/index.js';
import { receiptSchema } from '../../models/receipt.js';

export const uploadFile = async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                error: 'No file uploaded',
                message: 'Please select a file to upload'
            });
        }

        const file = req.file;

        // File information
        const fileInfo = {
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            sizeInMB: (file.size / (1024 * 1024)).toFixed(2),
            uploadTime: new Date().toISOString()
        };

        console.log('Processing file:', fileInfo);

        // Send to Tesseract OCR service
        const formData = new FormData();
        formData.append('image', new Blob([file.buffer]), file.originalname);

        const ocrResponse = await axios.post(`${config.services.tesseract.baseUrl}/ocr`, formData);

        if (ocrResponse.status !== 200) {
            throw new Error(`OCR service error: ${ocrResponse.statusText}`);
        }

        console.log('OCR completed, sending text for LLM extraction');

        // Extract receipt information using LLM
        const llmResponse = await extractReceiptInfo(ocrResponse.data.text);
        console.log('LLM Response:', llmResponse);

        // Validate the LLM response

        const parsedResponse = JSON.parse(llmResponse.response);
        const validation = receiptSchema.safeParse(parsedResponse);

        if (!validation.success) {
            console.log(validation.error);
            throw new Error(`LLM response validation failed: ${validation.error}`);
        }

        res.json({
            success: true,
            message: 'File uploaded and processed successfully',
            data: {
                fileInfo,
                ocrResult: ocrResponse.data,
                receiptData: validation.data,
                processing: {
                    duration: llmResponse.total_duration,
                    timestamp: new Date().toISOString()
                }
            }
        });

    } catch (error) {
        console.error('Upload/processing error:', error);

        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to process file upload or OCR',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}