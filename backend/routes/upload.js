import express from 'express';
import { upload } from '../middleware/upload.js';
import axios from 'axios';
import { z } from 'zod';
import ollama from '../services/ollama.js'

const router = express.Router();

// Zod schema for receipt parsing
const receiptSchema = z.object({
    store_name: z.string().nullish(),
    items: z.array(z.object({
        name: z.string().nullish(),
        quantity: z.number().default(1).nullish(),
        price_per_unit: z.number().nullish(),
        total: z.number().nullish()
    })),
    subtotal: z.number().nullish()
});

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

        console.log('Sending text for LLM extraction')
        const llmResponse = await ollama.generate({
            prompt: `Parse the following receipt OCR text and extract structured information. 
            Extract the store name, list of items with their item names, quantities, price per units, and total. The subtotal receipt amount is also required.
            If quantity is not specified for an item, default to 1. return as JSON.
            Here is the OCR text: ${ocrResponse.data.text}`,
            model: 'gemma3:latest',
            stream: false,
            format: receiptSchema,
        })
        console.log('LLM Response:', llmResponse);

        // Validate the LLM response against our schema
        let validatedLLMResult;

        try {
            validatedLLMResult = receiptSchema.parse(llmResponse);
        } catch (zodError) {
            console.warn('LLM response validation failed:', zodError);
            // Fallback to original response if validation fails
            validatedLLMResult = llmResponse.data;
        }

        res.json({
            success: true,
            message: 'Image uploaded and processed successfully',
            fileInfo: fileInfo,
            ocrResult: ocrResponse.data,
            llmResult: { 
            result :JSON.parse(llmResponse.response),
            duration: llmResponse.total_duration
            }
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
