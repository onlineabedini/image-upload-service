import { Router } from 'express';
import { addImage } from '../controllers/addImageController';
import { addComment } from '../controllers/addCommentController';
import multer from 'multer';

const upload = multer({ dest: '../uploads/' });

const router = Router();

// image
router.post('/', upload.single('file'), addImage);

// comment for image
router.post('/:imageId/comments', addComment);

export default router;
