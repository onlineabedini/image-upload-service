import { Router } from 'express';
import imageRouter from './imageRoutes';

const router = Router();

router.use('/images', imageRouter);

export default router;
