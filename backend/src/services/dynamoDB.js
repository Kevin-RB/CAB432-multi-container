import { DynamoDBClient, CreateTableCommand, DescribeTableCommand, waitUntilTableExists } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, UpdateCommand, GetCommand, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { TABLE_NAME, TABLE_SCHEMA, QUT_USERNAME } from '../utils/dynamo-utils.js';

// Initialize DynamoDB client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Check if table exists
export const checkTableExists = async () => {
    try {
        await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
        return true;
    } catch (error) {
        if (error.name === 'ResourceNotFoundException') {
            return false;
        }
        throw error;
    }
};

// Create the DynamoDB table
export const createReceiptsTable = async () => {
    try {
        console.log(`Creating DynamoDB table: ${TABLE_NAME}`);

        const tableExists = await checkTableExists();
        if (tableExists) {
            console.log(`Table ${TABLE_NAME} already exists`);
            return;
        }

        await client.send(new CreateTableCommand(TABLE_SCHEMA));

        console.log(`Waiting for table ${TABLE_NAME} to be active...`);
        await waitUntilTableExists(
            { client, maxWaitTime: 300 }, // 5 minutes max wait
            { TableName: TABLE_NAME }
        );

        console.log(`Table ${TABLE_NAME} created successfully`);
    } catch (error) {
        console.error('Error creating table:', error);
        throw new Error(`Failed to create table: ${error.message}`);
    }
};

// Initialize table (call this when your app starts)
export const initializeDynamoDB = async () => {
    try {
        await createReceiptsTable();
        console.log('DynamoDB initialization completed');
    } catch (error) {
        console.error('DynamoDB initialization failed:', error);
        throw error;
    }
};

export const createReceiptRecord = async (userId, s3Key, fileInfo) => {
    // this function is placed here just to create the table before any operations
    // This should ideally be called once during app initialization
    // await initializeDynamoDB();
    // 
    // 
    const receiptId = uuidv4();
    const timestamp = new Date().toISOString();

    const item = {
        "qut-username": QUT_USERNAME,
        receiptId,
        userId,
        s3Key,
        status: 'PROCESSING',
        fileInfo: {
            originalName: fileInfo.originalname,
            mimeType: fileInfo.mimetype,
            size: fileInfo.size
        },
        createdAt: timestamp,
        updatedAt: timestamp,
        ttl: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days TTL
    };

    try {
        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: item
        }));

        return {
            receiptId,
            status: 'PROCESSING',
            createdAt: timestamp
        };
    } catch (error) {
        console.error('Error creating receipt record:', error);
        throw new Error(`Failed to create receipt record: ${error.message}`);
    }
};

export const updateReceiptRecord = async (receiptId, updateData) => {
    const timestamp = new Date().toISOString();

    try {
        const updateExpression = [];
        const expressionAttributeValues = {};
        const expressionAttributeNames = {};

        // Build dynamic update expression
        if (updateData.status) {
            updateExpression.push('#status = :status');
            expressionAttributeNames['#status'] = 'status';
            expressionAttributeValues[':status'] = updateData.status;
        }

        if (updateData.ocrResult) {
            updateExpression.push('ocrResult = :ocrResult');
            expressionAttributeValues[':ocrResult'] = updateData.ocrResult;
        }

        if (updateData.receiptData) {
            updateExpression.push('receiptData = :receiptData');
            expressionAttributeValues[':receiptData'] = updateData.receiptData;
        }

        if (updateData.processing) {
            updateExpression.push('processing = :processing');
            expressionAttributeValues[':processing'] = updateData.processing;
        }

        if (updateData.error) {
            updateExpression.push('errorDetails = :error');
            expressionAttributeValues[':error'] = updateData.error;
        }

        // Always update the updatedAt timestamp
        updateExpression.push('updatedAt = :updatedAt');
        expressionAttributeValues[':updatedAt'] = timestamp;

        const params = {
            TableName: TABLE_NAME,
            Key: {
                "qut-username": QUT_USERNAME, // Partition key
                receiptId // Sort key
            },
            UpdateExpression: `SET ${updateExpression.join(', ')}`,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        };

        if (Object.keys(expressionAttributeNames).length > 0) {
            params.ExpressionAttributeNames = expressionAttributeNames;
        }

        const result = await docClient.send(new UpdateCommand(params));
        return result.Attributes;
    } catch (error) {
        console.error('Error updating receipt record:', error);
        throw new Error(`Failed to update receipt record: ${error.message}`);
    }
};

export const getReceiptRecord = async (receiptId) => {
    try {
        const result = await docClient.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                "qut-username": QUT_USERNAME, // Partition key
                receiptId // Sort key
            }
        }));

        return result.Item;
    } catch (error) {
        console.error('Error getting receipt record:', error);
        throw new Error(`Failed to get receipt record: ${error.message}`);
    }
};

export const getUserReceipts = async (userId, limit = 5) => {
    try {
        // Use Query to get all receipts for your QUT username, then filter by userId
        const result = await docClient.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: '#qutUsername = :qutUsername',
            FilterExpression: 'userId = :userId',
            ExpressionAttributeNames: {
                '#qutUsername': 'qut-username'
            },
            ExpressionAttributeValues: {
                ':qutUsername': QUT_USERNAME,
                ':userId': userId
            },
            ScanIndexForward: false, // Sort by receiptId descending (newest first)
            Limit: limit
        }));

        return result.Items || [];
    } catch (error) {
        console.error('Error getting user receipts:', error);
        throw new Error(`Failed to get user receipts: ${error.message}`);
    }
};

// Get all receipts for your QUT username (regardless of app userId)
export const getAllMyReceipts = async (limit = 50) => {
    try {
        const result = await docClient.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: '#qutUsername = :qutUsername',
            ExpressionAttributeNames: {
                '#qutUsername': 'qut-username'
            },
            ExpressionAttributeValues: {
                ':qutUsername': QUT_USERNAME
            },
            ScanIndexForward: false, // Sort by receiptId descending
            Limit: limit
        }));

        return result.Items || [];
    } catch (error) {
        console.error('Error getting all receipts:', error);
        throw new Error(`Failed to get all receipts: ${error.message}`);
    }
};