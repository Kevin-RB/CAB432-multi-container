import express from 'express';
import { 
    getAllReceipts, 
    getReceiptById, 
    clearStorage,
} from '../../controllers/v1/receipts.controller.js';

const router = express.Router();

// GET /api/v1/receipts - Get all receipts
router.get('/', getAllReceipts);

// GET /api/v1/receipts/:id - Get specific receipt by ID
router.get('/:id', getReceiptById);

// DELETE /api/v1/receipts - Clear all stored receipts
router.delete('/', clearStorage);

export default router;
