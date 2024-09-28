import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Image } from '../entities/Image';
import fs from 'fs';
import path from 'path';
import util from 'util';
import dotenv from 'dotenv';

dotenv.config();

// import AWS from 'aws-sdk';

// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY,
//   secretAccessKey: process.env.AWS_SECRET_KEY,
// });

const unlinkFile = util.promisify(fs.unlink); 

// check /uploads
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Add Image
export const addImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const file: any = req.file;

    if (!file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }

    const localPath = path.join(uploadsDir, file.filename + '.jpeg');
    fs.renameSync(file.path, localPath);
    
    // S3
    /*
    const fileStream = fs.createReadStream(localPath);

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Body: fileStream,
      Key: file.filename,
    };

    const result = await s3.upload(uploadParams).promise();

    await unlinkFile(localPath);
    */

    // Using local file url
    const imageUrl = `/uploads/${file.filename}`;

    const imageRepository = getRepository(Image);
    const newImage = imageRepository.create({
      imageUrl,
      metadata: JSON.stringify(file),
    });
    const savedImage = await imageRepository.save(newImage);

    res.status(201).json(savedImage);
  } catch (error: any) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: error.message });
  }
};
