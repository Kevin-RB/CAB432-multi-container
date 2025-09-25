import { getUserReceipts, getAllMyReceipts, getReceiptRecord } from "../../services/dynamoDB.js";
import { getQutUsername } from "../../utils/dynamo-utils.js";
import { getPreSignedUrl } from "../../services/s3-storage.js";

// Get all receipts for the authenticated user
export const getUserReceiptHistory = async (req, res) => {
    try {
        const { userId } = req.user;
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;

        // Get user receipts from DynamoDB
        const receipts = await getUserReceipts(userId, limit + offset);

        // Apply offset manually (DynamoDB doesn't have built-in offset)
        const paginatedReceipts = receipts.slice(offset, offset + limit);

        // Transform data for response
        const receiptHistory = paginatedReceipts.map(receipt => ({
            receiptId: receipt.receiptId,
            createdAt: receipt.createdAt,
            updatedAt: receipt.updatedAt,
            status: receipt.status,
            fileInfo: receipt.fileInfo,
            ocrResult: receipt.ocrResult || null,
            viewUrl: receipt.s3Key,
            receiptData: receipt.receiptData || null,
        }));

        res.json({
            success: true,
            message: 'Successfully retrieved receipt history',
            data: {
                receipts: receiptHistory,
                pagination: {
                    currentPage: Math.floor(offset / limit) + 1,
                    totalItems: receipts.length,
                    itemsPerPage: limit,
                    hasNextPage: offset + limit < receipts.length,
                    hasPreviousPage: offset > 0,
                    nextPage: offset + limit < receipts.length ? Math.floor((offset + limit) / limit) + 1 : null,
                    previousPage: offset > 0 ? Math.floor((offset - limit) / limit) + 1 : null
                },
            }
        });

    } catch (error) {
        console.error('Error getting user receipt history:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to retrieve receipt history',
        });
    }
};

// Get a specific receipt by ID
export const getReceiptById = async (req, res) => {
    try {
        const { receiptId } = req.params;
        const { userId } = req.user;

        if (!receiptId) {
            return res.status(400).json({
                success: false,
                error: 'Missing receipt ID',
                message: 'Receipt ID parameter is required'
            });
        }

        // console.log(`Fetching receipt: ${receiptId} for user: ${userId}`);

        // Get receipt from DynamoDB
        const receipt = await getReceiptRecord(receiptId);

        if (!receipt) {
            return res.status(404).json({
                success: false,
                error: 'Receipt not found',
                message: `Receipt with ID '${receiptId}' not found`
            });
        }

        // Verify the receipt belongs to the requesting user
        if (receipt.userId !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Access denied',
                message: 'You do not have permission to access this receipt'
            });
        }

        // Transform receipt data for response
        const receiptData = {
            receiptId: receipt.receiptId,
            createdAt: receipt.createdAt,
            updatedAt: receipt.updatedAt,
            status: receipt.status,
            fileInfo: receipt.fileInfo,
            ocrResult: receipt.ocrResult || null,
            viewUrl: receipt.s3Key,
            receiptData: receipt.receiptData || null,
        };

        res.json({
            success: true,
            message: 'Successfully retrieved receipt',
            data: receiptData
        });

    } catch (error) {
        console.error('Error getting receipt by ID:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to retrieve receipt',
        });
    }
};

// Get all receipts (admin function - all receipts in your QUT namespace)
export const getAllReceipts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const username = await getQutUsername()
        console.log('Fetching all receipts from QUT namespace');

        // Get all receipts from DynamoDB
        const receipts = await getAllMyReceipts(limit);

        // Transform data for response
        const receiptHistory = receipts.map(receipt => ({
            receiptId: receipt.receiptId,
            userId: receipt.userId, // Show which app user uploaded it
            status: receipt.status,
            fileInfo: receipt.fileInfo,
            createdAt: receipt.createdAt,
            updatedAt: receipt.updatedAt,
            hasOcrResult: !!receipt.ocrResult,
            hasReceiptData: !!receipt.receiptData,
            totalAmount: receipt.receiptData?.total || null,
            itemCount: receipt.receiptData?.items?.length || 0
        }));

        res.json({
            success: true,
            message: 'Successfully retrieved all receipts',
            data: {
                receipts: receiptHistory,
                totalCount: receipts.length,
                qutUsername: username
            }
        });

    } catch (error) {
        console.error('Error getting all receipts:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to retrieve all receipts',
        });
    }
};

export const getReceiptImageUrl = async (req, res) => {
    console.log("Received request for receipt image URL");
    try {
        const s3key = req.query.s3key;

        if (!s3key) {
            return res.status(400).json({
                success: false,
                error: 'Missing image ID',
                message: 'Image ID parameter is required'
            });
        }

        // Validate S3 key format (optional but recommended for security)
        if (!s3key.startsWith('receipts/')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid S3 key format',
                message: 'S3 key must start with "receipts/"'
            });
        }

        const { url } = await getPreSignedUrl(s3key); // URL valid for 15 minutes

        res.json({
            success: true,
            message: 'Successfully retrieved receipt image URL',
            data: { url, s3key }
        });
    } catch (error) {
        console.error('Error getting receipt image URL:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to retrieve receipt image URL'
        });
    }
}