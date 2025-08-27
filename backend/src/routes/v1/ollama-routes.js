import express from 'express';
import { generateResponse, getModelList, testGenerateRecipe } from '../../controllers/v1/llm.controller.js';

const router = express.Router();

router.get('/models', getModelList);

router.post('/generate', generateResponse);

router.post('/recipe-suggestion', testGenerateRecipe);

export default router;
