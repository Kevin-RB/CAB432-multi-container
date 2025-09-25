import express from 'express';
import {
    getAllReceipts,
    getUserReceiptHistory,
    getReceiptById,
    getReceiptImageUrl,
} from '../../controllers/v1/receipts.controller.js';

const router = express.Router();

// Get all receipts for authenticated user
router.get('/', getUserReceiptHistory);

// Get pre-signed URL for receipt image
router.get('/image', getReceiptImageUrl);

// Get specific receipt by ID
router.get('/:receiptId', getReceiptById);

// Get all receipts in QUT namespace (admin function)
router.get('/admin/receipts', getAllReceipts);


export default router;
