/**
 * Lambda Function: DLQ Handler
 * Processes failed messages from cosmic-tesseract-dlq and cosmic-llm-dlq
 * Updates DynamoDB with failure status and error details
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({
    region: process.env.AWS_REGION || 'ap-southeast-2'
}));

const RECEIPTS_TABLE = process.env.RECEIPTS_TABLE_NAME || 'cosmic-receipts';

export const handler = async (event) => {
    console.log('DLQ Handler invoked with event:', JSON.stringify(event, null, 2));

    const results = {
        processed: 0,
        failed: 0,
        errors: []
    };

    // Process each record from SQS DLQ
    for (const record of event.Records) {
        try {
            const messageBody = JSON.parse(record.body);
            const { receiptId, userId, qutUsername, s3Key } = messageBody;

            // Determine which queue this came from
            const sourceQueue = record.eventSourceARN.includes('tesseract-dlq') 
                ? 'OCR_QUEUE' 
                : 'LLM_QUEUE';

            console.log(`Processing failed message for receipt ${receiptId} from ${sourceQueue}`);

            // Get message attributes
            const approximateReceiveCount = record.attributes?.ApproximateReceiveCount || 'unknown';
            const sentTimestamp = record.attributes?.SentTimestamp 
                ? new Date(parseInt(record.attributes.SentTimestamp)).toISOString()
                : new Date().toISOString();

            // Update DynamoDB with failure details
            await dynamoClient.send(new UpdateCommand({
                TableName: RECEIPTS_TABLE,
                Key: {
                    'qut-username': qutUsername,
                    receiptId: receiptId
                },
                UpdateExpression: 'SET #status = :status, errorDetails = :error, updatedAt = :time',
                ExpressionAttributeNames: {
                    '#status': 'status'
                },
                ExpressionAttributeValues: {
                    ':status': 'FAILED',
                    ':error': {
                        failedQueue: sourceQueue,
                        receiveCount: approximateReceiveCount,
                        sentTimestamp: sentTimestamp,
                        failedAt: new Date().toISOString(),
                        reason: sourceQueue === 'OCR_QUEUE' 
                            ? 'OCR processing failed after 3 attempts'
                            : 'LLM processing failed after 3 attempts',
                        messageId: record.messageId
                    },
                    ':time': new Date().toISOString()
                }
            }));

            console.log(`✅ Updated receipt ${receiptId} with FAILED status`);
            results.processed++;

        } catch (error) {
            console.error('Error processing DLQ message:', error);
            results.failed++;
            results.errors.push({
                messageId: record.messageId,
                error: error.message
            });
        }
    }

    console.log('DLQ Handler results:', results);

    // Return success (Lambda will auto-delete messages from DLQ)
    // If we throw an error, messages stay in DLQ for retry
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'DLQ processing completed',
            results
        })
    };
};
