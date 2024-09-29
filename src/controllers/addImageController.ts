import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Image } from '../entities/Image';
import fs from 'fs';
import path from 'path';
import util from 'util';
import dotenv from 'dotenv';
import { S3, SQS } from 'aws-sdk';

dotenv.config();

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY!,
  secretAccessKey: process.env.AWS_SECRET_KEY!,
  region: process.env.AWS_REGION!,
});

const sqs = new SQS({
  region: process.env.AWS_REGION!,
});

const unlinkFile = util.promisify(fs.unlink);

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const addImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file as Express.Multer.File;

    if (!file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }

    const localPath = path.join(uploadsDir, file.filename + path.extname(file.originalname));

    fs.renameSync(file.path, localPath);

    let imageUrl: string;
    let savedImage: Image;
    let isSavedToS3 = false;

    try {
      const fileStream = fs.createReadStream(localPath);

      const uploadParams: S3.PutObjectRequest = {
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Body: fileStream,
        Key: `${Date.now()}-${file.filename}${path.extname(file.originalname)}`,
        ContentType: file.mimetype,
      };

      const result = await s3.upload(uploadParams).promise();

      imageUrl = result.Location;

      await unlinkFile(localPath);

      isSavedToS3 = true;
    } catch (s3Error) {
      console.error('Error uploading to S3:', s3Error);

      imageUrl = `/uploads/${file.filename}${path.extname(file.originalname)}`;
    }

    const imageRepository = getRepository(Image);
    const newImage = imageRepository.create({
      imageUrl,
      metadata: JSON.stringify({
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      }),
    });
    savedImage = await imageRepository.save(newImage);

    if (isSavedToS3) {
      const sqsParams: SQS.SendMessageRequest = {
        MessageBody: JSON.stringify({ imageId: savedImage.id }),
        QueueUrl: process.env.AWS_SQS_QUEUE_URL!,
      };

      try {
        await sqs.sendMessage(sqsParams).promise();
        console.log(`Message sent to SQS for image ID: ${savedImage.id}`);
      } catch (sqsError) {
        console.error('Error sending message to SQS:', sqsError);
      }
    }

    res.status(201).json({
      message: isSavedToS3
        ? 'Image uploaded successfully to S3.'
        : 'S3 upload failed. Image saved locally.',
      image: savedImage,
    });
  } catch (error:any) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: error.message });
  }
};
