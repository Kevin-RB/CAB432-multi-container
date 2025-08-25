import express from 'express';
import { checkHealth } from '../../controllers/v1/health.controller.js';

const router = express.Router();

// Mount health check route
router.get('/', checkHealth);

export default router;
