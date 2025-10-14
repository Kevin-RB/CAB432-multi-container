import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { cachedSQSTesseractUrl } from './cachedParameters.js';

const sqsClient = new SQSClient({ 
  region: process.env.AWS_REGION || 'ap-southeast-2' 
});

/**
 * Send a message to an SQS queue
 */
export async function sendToQueue(queueUrl, messageBody) {
  const command = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(messageBody),
    MessageAttributes: {
      timestamp: {
        DataType: 'String',
        StringValue: new Date().toISOString()
      }
    }
  });

  const result = await sqsClient.send(command);
  console.log(`Message sent to queue ${queueUrl}:`, result.MessageId);
  return result;
}

/**
 * Poll messages from SQS queue (for workers)
 */
export async function receiveFromQueue(queueUrl, maxMessages = 1) {
  const command = new ReceiveMessageCommand({
    QueueUrl: queueUrl,
    MaxNumberOfMessages: maxMessages,
    WaitTimeSeconds: 20, // Long polling!
    VisibilityTimeout: 60, // Worker has 60s to process
    MessageAttributeNames: ['All']
  });

  const result = await sqsClient.send(command);
  return result.Messages || [];
}

/**
 * Delete message after successful processing
 */
export async function deleteFromQueue(queueUrl, receiptHandle) {
  const command = new DeleteMessageCommand({
    QueueUrl: queueUrl,
    ReceiptHandle: receiptHandle
  });

  await sqsClient.send(command);
  console.log('Message deleted from queue');
}

export const sendToTesseractQueue = async (messageBody) => {
  const queueUrl = await cachedSQSTesseractUrl();
  if (!queueUrl) throw new Error('SQS_TESSERACT_URL not configured');
  return sendToQueue(queueUrl, messageBody);
}

export const sendToOLLamaQueue = async (messageBody) => {
  const queueUrl = await cachedSQSOLLamaUrl();
  if (!queueUrl) throw new Error('SQS_OLLAMA_URL not configured');
  return sendToQueue(queueUrl, messageBody);
}