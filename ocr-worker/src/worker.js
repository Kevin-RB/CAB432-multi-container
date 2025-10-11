import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand, SendMessageCommand } from '@aws-sdk/client-sqs';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import axios from 'axios';

const sqsClient = new SQSClient({ });
const s3Client = new S3Client({ });

const OCR_QUEUE_URL = process.env.OCR_QUEUE_URL;
const LLM_QUEUE_URL = process.env.LLM_QUEUE_URL;
const TESSERACT_URL = process.env.TESSERACT_URL || 'http://tesseract:3001';
const S3_BUCKET = process.env.S3_BUCKET_NAME;

async function processOcrMessage(message) {
    const data = JSON.parse(message.Body);
    const { receiptId, s3Key, userId, qutUsername } = data;

    console.log(`Processing OCR for receipt: `, data);

    try {
        // 1. Download image from S3
        const s3Response = await s3Client.send(new GetObjectCommand({
            Bucket: S3_BUCKET,
            Key: s3Key
        }));

        const imageBuffer = await streamToBuffer(s3Response.Body);

        // 2. Call Tesseract OCR service
        const formData = new FormData();
        formData.append('image', new Blob([imageBuffer]));

        const ocrResponse = await axios.post(`${TESSERACT_URL}/ocr`, formData);

        console.log(`OCR completed for receipt ${receiptId}`);

        // 3. Send to LLM queue
        await sqsClient.send(new SendMessageCommand({
            QueueUrl: LLM_QUEUE_URL,
            MessageBody: JSON.stringify({
                receiptId,
                userId,
                qutUsername,  // Pass through to LLM worker
                s3Key,
                ocrResult: ocrResponse.data
            })
        }));

        console.log(`Sent to LLM queue: ${receiptId}`);

        // 4. Delete message from OCR queue
        await sqsClient.send(new DeleteMessageCommand({
            QueueUrl: OCR_QUEUE_URL,
            ReceiptHandle: message.ReceiptHandle
        }));

    } catch (error) {
        console.error(`Error processing OCR for ${receiptId}:`, error);
        // Message will become visible again after visibility timeout
        // Consider: Send to DLQ after X retries
    }
}

async function streamToBuffer(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
}

// Main worker loop
async function startWorker() {
    console.log('OCR Worker starting...');
    console.log('Polling queue:', OCR_QUEUE_URL);

    while (true) {
        try {
            const { Messages } = await sqsClient.send(new ReceiveMessageCommand({
                QueueUrl: OCR_QUEUE_URL,
                MaxNumberOfMessages: 1,
                WaitTimeSeconds: 20, // Long polling
                VisibilityTimeout: 60
            }));

            if (Messages && Messages.length > 0) {
                for (const message of Messages) {
                    await processOcrMessage(message);
                }
            }
        } catch (error) {
            console.error('Worker error:', error);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s on error
        }
    }
}

// Start the worker
startWorker();