import { uploadFileToS3 } from '../../services/s3-storage.js';
import { createReceiptRecord, updateReceiptRecord } from '../../services/dynamoDB.js';
import { sendToTesseractQueue } from '../../services/sqs.js';

export const uploadFile = async (req, res) => {
    try {
        // 1. Validate file
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({
                error: 'No file uploaded',
                message: 'Please select a file to upload'
            });
        }

        // Recieved file info
        const file = req.file
        const { userId } = req.user
        console.log(`File received from user ${userId}:`, file.originalname, file.mimetype, file.size);

        // 2. Upload file to S3
        const { key: S3key } = await uploadFileToS3(file, userId);
        console.log('File uploaded to S3:', S3key);

        // 3. Create initial DynamoDB record with PROCESSING status
        const receiptRecord = await createReceiptRecord(userId, S3key, file);
        console.log('Receipt created in DynamoDB:', receiptRecord);
        console.log("API: ", receiptRecord);    
        // 4. Send to OCR queue
        await sendToTesseractQueue({
            receiptId: receiptRecord.receiptId,
            s3Key: S3key,
            userId: userId,
            qutUsername: receiptRecord['qut-username'],  // Include qut-username for workers
            originalFileName: file.originalname,
            mimeType: file.mimetype,
            size: file.size
        })

        console.log('Message sent to Tesseract OCR queue');

        res.json({
            success: true,
            message: 'File uploaded and processed successfully',
            data: {
                receiptId: receiptRecord.receiptId,
                status: 'PENDING',
                s3Key: S3key,
                viewUrl: `/api/v1/receipts/${receiptRecord.receiptId}`
            },
        });
    } catch (error) {
        // Update DynamoDB record with error status if record was created
        if (receiptRecord) {
            try {
                await updateReceiptRecord(receiptRecord.receiptId, {
                    status: 'FAILED',
                    error: {
                        message: error.message,
                        timestamp: new Date().toISOString()
                    }
                })
            } catch (updateError) {
                console.error('Error updating receipt record with failure status:', updateError);
            }
        }
        console.error('Error processing file:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to process file',
        });
    }
}