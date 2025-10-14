import express from 'express';
import { 
    uploadFile, 
} from '../../controllers/v1/upload.controller.js';
import { upload } from '../../services/multer.js';

const router = express.Router();

// File upload endpoint
router.post('/', upload.single('receipt-image'), uploadFile);

export default router;
