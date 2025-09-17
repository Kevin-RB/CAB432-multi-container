import express from 'express';
import { 
    getAllReceipts,
    getUserReceiptHistory,
    getReceiptById,
} from '../../controllers/v1/receipts.controller.js';

const router = express.Router();

// GET /api/v1/receipts - Get all receipts
// router.get('/', getPaginatedReceiptsOld);

// GET /api/v1/receipts/:id - Get specific receipt by ID
// router.get('/:id', getReceiptById);

// Get all receipts for authenticated user
router.get('/', getUserReceiptHistory);

// Get specific receipt by ID
router.get('/:receiptId', getReceiptById);

// Get all receipts in QUT namespace (admin function)
router.get('/admin/receipts', getAllReceipts);

export default router;
