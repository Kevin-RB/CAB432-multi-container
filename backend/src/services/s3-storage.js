import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import config from '../config/index.js';
import { v4 as uuidv4 } from 'uuid'

function getCredentials() {
    if (process.env.AWS_ACCESS_KEY_ID
        && process.env.AWS_SECRET_ACCESS_KEY
        && process.env.AWS_SESSION_TOKEN) {
        return {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN
        }
    }
    return undefined; // Use IAM role if no explicit credentials
}

const s3Client = new S3Client({
    region: config.aws.region,
    credentials: getCredentials()
});

export const uploadFileToS3 = async (file, userId) => {
    const key = `receipts/${userId}/${uuidv4()}`;

    const command = new PutObjectCommand({
        Bucket: config.aws.s3BucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
            'user-id': userId,
            'original-filename': file.originalname,
        }
    });

    const result = await s3Client.send(command);
    return { key, ...result };
};

export const listUserFilesFromS3 = async (userId) => {
    const command = new ListObjectsV2Command({
        Bucket: config.aws.s3BucketName,
        Prefix: `receipts/${userId}/`
    });
    return s3Client.send(command);
}