import AWS from 'aws-sdk';
import { getRepository } from 'typeorm';
import { Image } from '../entities/Image';
import { sendEmailNotification } from '../utils/notificationService';
import sharp from 'sharp';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const sqs = new AWS.SQS({ region: process.env.AWS_REGION });
const s3 = new AWS.S3({ region: process.env.AWS_REGION });

const POLL_INTERVAL = 10000;
const IMAGE_BUCKET = process.env.AWS_S3_BUCKET_NAME!;
const PROCESSED_FOLDER = 'processed/';

interface ImageMetadata {
  originalName: string;
  mimeType: string;
  size: number;
  thumbnailUrl?: string;
  [key: string]: any;
}

const processImages = async () => {
  const params: AWS.SQS.ReceiveMessageRequest = {
    QueueUrl: process.env.AWS_SQS_QUEUE_URL!,
    MaxNumberOfMessages: 5,
    WaitTimeSeconds: 20,
  };

  try {
    const data = await sqs.receiveMessage(params).promise();

    if (data.Messages && data.Messages.length > 0) {
      for (const message of data.Messages) {
        try {
          if (!message.Body) {
            throw new Error('Message body is empty');
          }

          const { imageId } = JSON.parse(message.Body);

          const imageRepository = getRepository(Image);
          const image = await imageRepository.findOne(imageId);

          if (!image) {
            console.warn(`Image with ID ${imageId} not found.`);
            continue;
          }

          const imageKey = new URL(image.imageUrl).pathname.substring(1);
          const imageData = await s3.getObject({ Bucket: IMAGE_BUCKET, Key: imageKey }).promise();

          if (!imageData.Body) {
            throw new Error('Image data is empty');
          }

          const thumbnailBuffer = await sharp(imageData.Body as Buffer)
            .resize(200, 200)
            .toBuffer();

          const thumbnailKey = `${PROCESSED_FOLDER}thumbnail-${path.basename(imageKey)}`;

          await s3
            .putObject({
              Bucket: IMAGE_BUCKET,
              Key: thumbnailKey,
              Body: thumbnailBuffer,
              ContentType: 'image/jpeg',
            })
            .promise();

          const metadata: ImageMetadata = image.metadata ? JSON.parse(image.metadata) : {};
          metadata.thumbnailUrl = `https://${IMAGE_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${thumbnailKey}`;
          image.metadata = JSON.stringify(metadata);

          await imageRepository.save(image);
          await sendEmailNotification(image);

          if (!message.ReceiptHandle) {
            throw new Error('Message receipt handle is missing');
          }

          await sqs
            .deleteMessage({
              QueueUrl: process.env.AWS_SQS_QUEUE_URL!,
              ReceiptHandle: message.ReceiptHandle,
            })
            .promise();

          console.log(`Processed image ID ${imageId}`);
        } catch (err) {
          console.error('Error processing message:', err);
        }
      }
    }
  } catch (err) {
    console.error('Error receiving messages:', err);
  }
};

setInterval(processImages, POLL_INTERVAL);
processImages();
