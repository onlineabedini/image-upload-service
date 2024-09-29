import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Image } from '../entities/Image';
import { Comment } from '../entities/Comment';

export const addComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const imageId = Number(req.params.imageId);
    const commentText: string = req.body.commentText;

    if (isNaN(imageId)) {
      res.status(400).json({ message: 'Invalid image ID' });
      return;
    }

    if (!commentText) {
      res.status(400).json({ message: 'Comment text is required' });
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
