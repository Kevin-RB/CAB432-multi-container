import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { extractReceiptInfo, generateRecipeSuggestions } from './ollama.js';
import { receiptSchema, recipeSchema } from './models/receipt.js';

const sqsClient = new SQSClient({ 
    region: process.env.AWS_REGION || 'ap-southeast-2' 
});
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ 
    region: process.env.AWS_REGION || 'ap-southeast-2' 
}));

const LLM_QUEUE_URL = process.env.LLM_QUEUE_URL;
const RECEIPTS_TABLE = process.env.RECEIPTS_TABLE_NAME;


async function processLlmMessage(message) {
    const data = JSON.parse(message.Body);
    const { receiptId, userId, ocrResult, qutUsername } = data;
    const ocrText = ocrResult.text;
 
-    console.log(`Processing LLM for receipt ${receiptId}`);

    try {

        // Extract receipt information using LLM
        const llmLLMJsonParse = await extractReceiptInfo(ocrText);
        console.log('LLM Response:', llmLLMJsonParse);

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

        if (!suggestionValidation.success) {
            console.log(suggestionValidation.error);
            throw new Error(`Recipe suggestion validation failed: ${suggestionValidation.error}`);
        }

        // 3. Update DynamoDB
        console.log('Updating DynamoDB record');
        console.log('Table:', RECEIPTS_TABLE);
        console.log('DynamoDB Key:', { 'qut-username': qutUsername, receiptId: receiptId });
        console.log('DynamoDB Update Data:', { ...validation.data, recipes: suggestionValidation.data });

        await dynamoClient.send(new UpdateCommand({
            TableName: RECEIPTS_TABLE,
            Key: { 
                'qut-username': qutUsername,
                receiptId: receiptId 
            },
            UpdateExpression: 'SET #status = :status, receiptData = :data, ocrResult = :ocr, updatedAt = :time',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':status': 'COMPLETED',
                ':data': { ...validation.data, recipes: suggestionValidation.data },
                ':ocr': ocrResult,
                ':time': new Date().toISOString()
            }
        }));

        console.log(`Receipt ${receiptId} completed!`);

        // 4. Delete from queue
        await sqsClient.send(new DeleteMessageCommand({
            QueueUrl: LLM_QUEUE_URL,
            ReceiptHandle: message.ReceiptHandle
        }));

    } catch (error) {
        console.error(`Error processing LLM for ${receiptId}:`, error);

        // Update as FAILED
        await dynamoClient.send(new UpdateCommand({
            TableName: RECEIPTS_TABLE,
            Key: { 
                'qut-username': qutUsername,
                receiptId: receiptId 
            },
            UpdateExpression: 'SET #status = :status, #errorDetails = :error, updatedAt = :time',
            ExpressionAttributeNames: {
                '#status': 'status',
                '#errorDetails': 'errorDetails'
            },
            ExpressionAttributeValues: {
                ':status': 'FAILED',
                ':error': { message: error.message, timestamp: new Date().toISOString() },
                ':time': new Date().toISOString()
            }
        }));
    }
}

// Main worker loop (same pattern as OCR worker)
async function waitForOllama() {
    const maxRetries = 30;
    const retryDelay = 2000; // 2 seconds
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            const ollama = (await import('./ollama.js')).default;
            await ollama.list();
            console.log('Successfully connected to Ollama');
            return true;
        } catch (error) {
            console.log(`Waiting for Ollama to be ready... (attempt ${i + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
    throw new Error('Failed to connect to Ollama after maximum retries');
}

async function startWorker() {
    console.log('LLM Worker starting...');
    
    // Wait for Ollama to be ready before processing messages
    await waitForOllama();
    
    while (true) {
        try {
            const { Messages } = await sqsClient.send(new ReceiveMessageCommand({
                QueueUrl: LLM_QUEUE_URL,
                MaxNumberOfMessages: 1,
                WaitTimeSeconds: 20, // Long polling
                VisibilityTimeout: 60
            }));

            if (Messages && Messages.length > 0) {
                for (const message of Messages) {
                    await processLlmMessage(message);
                }
            }
        } catch (error) {
            console.error('Worker error:', error);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s on error
        }
    }
}

startWorker();