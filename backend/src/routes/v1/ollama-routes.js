import express from 'express';
import { generateResponse, getModelList } from '../../controllers/v1/llm.controller.js';

const router = express.Router();

router.get('/models', getModelList);

router.post('/generate', generateResponse);

export default router;
