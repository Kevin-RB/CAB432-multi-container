import { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PARAMETERS } from './paramenter-manager.js';

const s3Client = new S3Client({});

export const uploadFileToS3 = async (file, userId) => {
    const key = `receipts/${userId}/${uuidv4()}`;
    const bucketName = await PARAMETERS.AWS_S3_BUCKET_NAME();

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
    const bucketName = await PARAMETERS.AWS_S3_BUCKET_NAME();

    const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: `receipts/${userId}/`
    });
    return s3Client.send(command);
}

export const getPreSignedUrl = async (s3key, expiresIn = 900) => {
    const bucketName = await PARAMETERS.AWS_S3_BUCKET_NAME();
    
    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: s3key // This should be the full path: receipts/user-id/receipt-id
        });

        const url = await getSignedUrl(s3Client, command, {
            expiresIn // 15 minutes
        });

        return { url };
    } catch (error) {
        console.error('Error generating pre-signed URL:', error);
        throw new Error('Failed to generate pre-signed URL');
    }
}