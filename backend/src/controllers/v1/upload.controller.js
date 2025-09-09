import axios from 'axios';
import { extractReceiptInfo, generateRecipeSuggestions } from '../../services/ollama.js';
import config from '../../config/index.js';
import { receiptSchema, recipeSchema } from '../../models/receipt.js';
import fs from 'fs';
import path from 'path';
import { uploadFileToS3 } from '../../services/s3-storage.js';

export const uploadFile = async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({
                error: 'No file uploaded',
                message: 'Please select a file to upload'
            });
        }

        const file = req.file
        const { userId } = req.user

        const { key } = await uploadFileToS3(file, userId);
        console.log('File uploaded to S3:', key);

        return res.json({
            success: true,
            message: 'File uploaded successfully to S3',
            data: { key },
            fileInfo: {
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size
            }
        });

        // Send to Tesseract OCR service
        const formData = new FormData();
        formData.append('image', new Blob([file.buffer]));

        const ocrResponse = await axios.post(`${config.services.tesseract.baseUrl}/ocr`, formData);

        if (ocrResponse.status !== 200) {
            throw new Error(`OCR service error: ${ocrResponse.statusText}`);
        }
        console.log('OCR completed, sending text for LLM extraction');

        // Extract receipt information using LLM
        const llmLLMJsonParse = await extractReceiptInfo(ocrResponse.data.text);
        console.log('LLM Response:', llmLLMJsonParse);

        // Validate the LLM response
        const parsedResponse = JSON.parse(llmLLMJsonParse.response);
        const validation = receiptSchema.safeParse(parsedResponse);

        if (validation.error) {
            console.log(validation.error);
            throw new Error(`LLM response validation failed: ${validation.error}`);
        }
        console.log('LLM extraction and validation successful');

        console.log('Processing items for recipes');
        const items = validation.data.items
            .map(item => item.item_name)
            .filter(name => name && name.trim().length > 0)
            .join(', ');

        console.log('Extracted items for recipe generation:', items);

        console.log('Generating recipes');
        const llmRecipeSuggestions = await generateRecipeSuggestions(items);

        const parsedSuggestions = JSON.parse(llmRecipeSuggestions.response);
        const suggestionValidation = recipeSchema.safeParse(parsedSuggestions);

        if (suggestionValidation.error) {
            console.log(suggestionValidation.error);
            throw new Error(`Recipe suggestion validation failed: ${suggestionValidation.error}`);
        }

        const responseData = {
            fileInfo,
            ocrResult: ocrResponse.data,
            receiptData: { ...validation.data, recipes: suggestionValidation.data },
            processing: {
                duration: llmLLMJsonParse.total_duration + llmRecipeSuggestions.total_duration,
                timestamp: new Date().toISOString()
            }
        };

        // const storedReceipt = addToStorage({
        //     data: responseData
        // });

        res.json({
            success: true,
            message: 'File uploaded and processed successfully',
            data: responseData,
            storage: {
                test: "test content"
                //     receiptId: storedReceipt.id,
                //     storedAt: storedReceipt.storedAt,
                //     viewUrl: `/api/v1/receipts/${storedReceipt.id}`
            }
        });

    } catch (error) {
        // Clean up file if it exists and there was an error
        if (req.file && req.file.path) {
            cleanupFile(req.file.path);
        }
        console.error('Error processing file:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to process file',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

export const getStoredImages = async (req, res) => {
    try {
        const uploadsDir = path.join(process.cwd(), 'uploads');

        // Check if uploads directory exists
        if (!fs.existsSync(uploadsDir)) {
            return res.json({
                success: true,
                message: 'No uploads directory found',
                data: {
                    images: [],
                    totalCount: 0
                }
            });
        }

        // Read all files from uploads directory
        const files = fs.readdirSync(uploadsDir);

        // Filter only image files based on allowed MIME types
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return imageExtensions.includes(ext);
        });

        // Get detailed information for each image
        const images = imageFiles.map(filename => {
            const filePath = path.join(uploadsDir, filename);
            const stats = fs.statSync(filePath);

            // Extract timestamp from filename (assuming format: timestamp-originalname)
            const timestampMatch = filename.match(/^(\d+)-/);
            const timestamp = timestampMatch ? parseInt(timestampMatch[1]) : stats.birthtimeMs;

            return {
                filename,
                originalName: filename.replace(/^\d+-/, ''), // Remove timestamp prefix
                size: stats.size,
                sizeInMB: (stats.size / (1024 * 1024)).toFixed(2),
                uploadTime: new Date(timestamp).toISOString(),
                lastModified: stats.mtime.toISOString(),
                downloadUrl: `/api/v1/upload/image/${filename}`
            };
        });

        // Sort by upload time (newest first)
        images.sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));

        res.json({
            success: true,
            message: 'Successfully retrieved stored images',
            data: {
                images,
                totalCount: images.length,
                uploadsDirectory: uploadsDir
            }
        });

    } catch (error) {
        console.error('Error retrieving stored images:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to retrieve stored images',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const getImageFile = async (req, res) => {
    try {
        const { filename } = req.params;

        if (!filename) {
            return res.status(400).json({
                success: false,
                error: 'Missing filename',
                message: 'Filename parameter is required'
            });
        }

        const uploadsDir = path.join(process.cwd(), 'uploads');
        const filePath = path.join(uploadsDir, filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: 'File not found',
                message: `Image file '${filename}' not found`
            });
        }

        // Verify it's an image file
        const ext = path.extname(filename).toLowerCase();
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

        if (!imageExtensions.includes(ext)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid file type',
                message: 'Requested file is not a valid image'
            });
        }

        // Determine MIME type
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif'
        };

        const mimeType = mimeTypes[ext] || 'application/octet-stream';

        // Get file stats for headers
        const stats = fs.statSync(filePath);

        // Set appropriate headers
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Length', stats.size);
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

    } catch (error) {
        console.error('Error serving image file:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to serve image file',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};