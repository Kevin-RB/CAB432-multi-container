import { DynamoDBClient, CreateTableCommand, DescribeTableCommand, waitUntilTableExists } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, UpdateCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { getQutUsername, getTableName, getTableSchema } from '../utils/dynamo-utils.js';

// Initialize DynamoDB client
const client = new DynamoDBClient({ 
  region: process.env.AWS_REGION || 'ap-southeast-2' 
});
const docClient = DynamoDBDocumentClient.from(client);

// Check if table exists
export const checkTableExists = async (tableName) => {
    try {
        await client.send(new DescribeTableCommand({ TableName: tableName }));
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
        const tableName = await getTableName();
        console.log(`Creating DynamoDB table: ${tableName}`);

        const tableExists = await checkTableExists(tableName);
        if (tableExists) {
            console.log(`Table ${tableName} already exists`);
            return;
        }

        const tableSchema = await getTableSchema();

        await client.send(new CreateTableCommand(tableSchema));

        console.log(`Waiting for table ${tableName} to be active...`);
        await waitUntilTableExists(
            { client, maxWaitTime: 300 }, // 5 minutes max wait
            { TableName: tableName }
        );

        console.log(`Table ${tableName} created successfully`);
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

export const createReceiptRecord = async (userId, s3Key, fileInfo, status = 'PENDING') => {
    // this function is placed here just to create the table before any operations
    // This should ideally be called once during app initialization
    // await initializeDynamoDB();
    // 
    // 
    try {
        const username = await getQutUsername();
        const tableName = await getTableName();

        const receiptId = uuidv4();
        const timestamp = new Date().toISOString();

        const item = {
            "qut-username": username,
            receiptId,
            userId,
            s3Key,
            status,
            fileInfo: {
                originalName: fileInfo.originalname,
                mimeType: fileInfo.mimetype,
                size: fileInfo.size
            },
            createdAt: timestamp,
            updatedAt: timestamp,
        };

        await docClient.send(new PutCommand({
            TableName: tableName,
            Item: item
        }));

        return item;
    } catch (error) {
        console.error('Error creating receipt record:', error);
        throw new Error(`Failed to create receipt record: ${error.message}`);
    }
};

export const updateReceiptRecord = async (receiptId, updateData) => {
    const timestamp = new Date().toISOString();

    try {
        const tableName = await getTableName();
        const username = await getQutUsername();

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
            updateExpression.push('#errorDetails = :error');
            expressionAttributeNames['#errorDetails'] = 'errorDetails';
            expressionAttributeValues[':error'] = updateData.error;
        }

        // Always update the updatedAt timestamp
        updateExpression.push('updatedAt = :updatedAt');
        expressionAttributeValues[':updatedAt'] = timestamp;

        const params = {
            TableName: tableName,
            Key: {
                "qut-username": username, // Partition key
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
        const tableName = await getTableName();
        const username = await getQutUsername();

        const result = await docClient.send(new GetCommand({
            TableName: tableName,
            Key: {
                "qut-username": username, // Partition key
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
        const tableName = await getTableName();
        const username = await getQutUsername();

        // Use Query to get all receipts for your QUT username, then filter by userId
        const result = await docClient.send(new QueryCommand({
            TableName: tableName,
            KeyConditionExpression: '#qutUsername = :qutUsername',
            FilterExpression: 'userId = :userId',
            ExpressionAttributeNames: {
                '#qutUsername': 'qut-username'
            },
            ExpressionAttributeValues: {
                ':qutUsername': username,
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
        const tableName = await getTableName();
        const username = await getQutUsername();

        const result = await docClient.send(new QueryCommand({
            TableName: tableName,
            KeyConditionExpression: '#qutUsername = :qutUsername',
            ExpressionAttributeNames: {
                '#qutUsername': 'qut-username'
            },
            ExpressionAttributeValues: {
                ':qutUsername': username
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