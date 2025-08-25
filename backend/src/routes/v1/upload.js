import express from 'express';
import { upload } from '../../middleware/upload.js';
import { uploadFile } from '../../controllers/v1/upload.controller.js';

const router = express.Router();

// File upload endpoint
router.post('/', upload.single('file'), uploadFile);

export default router;
