// @collapse
import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Image } from '../entities/Image';
import { Comment } from '../entities/Comment';
import dotenv from 'dotenv';

dotenv.config();

// Add Comment
export const addComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const imageId: number = parseInt(req.params.imageId, 10); 
    const { commentText } = req.body;

    if (isNaN(imageId)) {
      res.status(400).json({ message: 'Invalid image ID' });
      return;
    }

    const imageRepository = getRepository(Image);

    const image = await imageRepository.findOne({ where: { id: imageId } });

    if (!image) {
      res.status(404).json({ message: 'Image not found' });
      return;
    }

    const commentRepository = getRepository(Comment);
    const newComment = commentRepository.create({
      commentText,
      image,
    });
    const savedComment = await commentRepository.save(newComment);

    res.status(201).json(savedComment);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'An unknown error occurred' });
  }
};
