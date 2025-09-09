import express from 'express';
import { 
    getPaginatedReceipts, 
    getReceiptById, 
} from '../../controllers/v1/receipts.controller.js';

const router = express.Router();

// GET /api/v1/receipts - Get all receipts
router.get('/', getPaginatedReceipts);

// GET /api/v1/receipts/:id - Get specific receipt by ID
router.get('/:id', getReceiptById);

export default router;
