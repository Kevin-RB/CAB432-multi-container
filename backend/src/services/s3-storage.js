import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import config from '../config/index.js';
import { v4 as uuidv4 } from 'uuid'

const s3Client = new S3Client({});

export const uploadFileToS3 = async (file, userId) => {
    const key = `receipts/${userId}/${uuidv4()}`;
    const bucketName = await config.aws.s3BucketName();

    const command = new PutObjectCommand({
        Bucket: bucketName,
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
    const bucketName = await config.aws.s3BucketName();

    const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: `receipts/${userId}/`
    });
    return s3Client.send(command);
}