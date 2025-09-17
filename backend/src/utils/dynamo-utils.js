
// Needed constants for shared DynamoDB table UNI environment
export const QUT_USERNAME = process.env.QUT_USERNAME || "n12112798@qut.edu.au";
export const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'n12112798-CosmicStorage';

// Table schema configuration for shared university environment
// Note: qut-username must remain as partition key for university access control
export const TABLE_SCHEMA = {
    TableName: TABLE_NAME,
    KeySchema: [
        {
            AttributeName: "qut-username",
            KeyType: "HASH" // Partition key (required by university)
        },
        {
            AttributeName: "receiptId", 
            KeyType: "RANGE" // Sort key (unique receipt identifier)
        }
    ],
    AttributeDefinitions: [
        {
            AttributeName: "qut-username",
            AttributeType: "S"
        },
        {
            AttributeName: "receiptId",
            AttributeType: "S"
        }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
    }
};