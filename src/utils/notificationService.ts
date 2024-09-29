import { SES } from 'aws-sdk';
import dotenv from 'dotenv';
import { Image } from '../entities/Image';

dotenv.config();

const ses = new SES({
  region: process.env.AWS_SES_REGION,
});

interface ImageMetadata {
  originalName: string;
  mimeType: string;
  size: number;
  thumbnailUrl?: string;
  [key: string]: any;
}

export const sendEmailNotification = async (image: any): Promise<void> => {
  const recipientEmails = process.env.RECIPIENT_EMAILS?.split(',') || [];
  if (recipientEmails.length === 0) {
    console.warn('No recipient emails configured.');
    return;
  }

  const metadata: ImageMetadata = JSON.parse(image.metadata);

  const params: SES.SendEmailRequest = {
    Destination: {
      ToAddresses: recipientEmails.map(email => email.trim()),
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: `<p>A new image has been processed:</p>
                 <p><a href="${image.imageUrl}">View Image</a></p>
                 <p><a href="${metadata.thumbnailUrl}">View Thumbnail</a></p>`,
        },
        Text: {
          Charset: 'UTF-8',
          Data: `A new image has been processed: ${image.imageUrl}\nThumbnail: ${metadata.thumbnailUrl}`,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'New Image Processed',
      },
    },
    Source: process.env.SES_SENDER_EMAIL!,
  };

  try {
    await ses.sendEmail(params).promise();
    console.log(`Email notification sent for image ID ${image.id}`);
  } catch (error) {
    console.error('Error sending email notification:', error);
    throw error;
  }
};
