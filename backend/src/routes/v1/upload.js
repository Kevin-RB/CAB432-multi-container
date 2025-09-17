import express from 'express';
import { 
    uploadFile, 
    getStoredImages, 
    getImageFile, 
} from '../../controllers/v1/upload.controller.js';
import { upload } from '../../services/multer.js';

const router = express.Router();

// File upload endpoint
router.post('/', upload.single('receipt-image'), uploadFile);

// Get list of all stored images (legacy - local storage)
router.get('/images', getStoredImages);

// Get individual image file (legacy - local storage)
router.get('/image/:filename', getImageFile);

export default router;
