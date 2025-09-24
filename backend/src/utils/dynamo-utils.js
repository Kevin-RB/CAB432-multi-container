import { PARAMETERS } from "../services/paramenter-manager.js";

// Needed constants for shared DynamoDB table UNI environment
let QUT_USERNAME = "" // to be set dynamically
let TABLE_NAME = ""  // to be set dynamically

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

export const getTableSchema = async () => {
    if (TABLE_SCHEMA.TableName) return TABLE_SCHEMA; // Return if already set
    await getTableName()
    return TABLE_SCHEMA
}

export const getTableName = async () => {
    if (TABLE_NAME) return TABLE_NAME; // Return if already set
    const tableName = await PARAMETERS.DYNAMODB_TABLE_NAME()
    TABLE_NAME = tableName

    return TABLE_NAME;
}

export const getQutUsername = async () => {
    if (QUT_USERNAME) return QUT_USERNAME;
    const qutUsername = await PARAMETERS.QUT_USERNAME()
    QUT_USERNAME = qutUsername

    return QUT_USERNAME;
}