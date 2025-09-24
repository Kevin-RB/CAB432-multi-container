import express from 'express';
import { getYoutubeVideoRecommendations } from '../../controllers/v1/videos.controller.js';

const router = express.Router();


router.get('/:query', getYoutubeVideoRecommendations);

export default router;
