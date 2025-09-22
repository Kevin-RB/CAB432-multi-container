import { getUserReceipts, getAllMyReceipts, getReceiptRecord } from "../../services/dynamoDB.js";
import { listUserFilesFromS3 } from "../../services/s3-storage.js";

let receiptStorage = [];

/**
 * Add a processed receipt to storage
 * @param {Object} receiptData - The processed receipt data
 * @returns {Object} - The stored receipt with added metadata
 */
export const addToStorageOld = (receiptData) => {
    const storedReceipt = {
        id: Date.now().toString(), // Simple ID generation
        ...receiptData,
        storedAt: new Date().toISOString()
    };

    receiptStorage.push(storedReceipt);
    console.log(`Added receipt to storage. Total receipts: ${receiptStorage.length}`);

    return storedReceipt;
};

/**
 * Get all stored receipts with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Number of receipts per page (default: 3)
 * @returns {Object} - Paginated receipts data
 */
export const getPaginatedReceiptsOld = async (req, res) => {
    try {
        // Parse pagination parameters from query string
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 3;

        // Validate pagination parameters
        if (page < 1) {
            return res.status(400).json({
                success: false,
                error: 'Invalid page number',
                message: 'Page number must be greater than 0'
            });
        }

        if (limit < 1 || limit > 5) {
            return res.status(400).json({
                success: false,
                error: 'Invalid limit',
                message: 'Limit must be between 1 and 5'
            });
        }

        // Calculate pagination values
        const totalReceipts = receiptStorage.length;
        const totalPages = Math.ceil(totalReceipts / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        // Get the receipts for the current page
        const paginatedReceipts = receiptStorage.slice(startIndex, endIndex);

        // Calculate pagination metadata
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        res.json({
            success: true,
            message: 'Successfully retrieved receipts',
            data: {
                receipts: paginatedReceipts,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: totalReceipts,
                    itemsPerPage: limit,
                    hasNextPage,
                    hasPreviousPage,
                    nextPage: hasNextPage ? page + 1 : null,
                    previousPage: hasPreviousPage ? page - 1 : null
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to retrieve receipts',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get a specific receipt by ID
 * @param {string} id - Receipt ID
 * @returns {Object} - The requested receipt or null if not found
 */

export const getReceiptByIdOld = (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'Missing ID',
                message: 'Receipt ID parameter is required'
            });
        }

        const receipt = receiptStorage.find(r => r.id === id);

        if (!receipt) {
            return res.status(404).json({
                success: false,
                error: 'Receipt not found',
                message: `Receipt with ID '${id}' not found`
            });
        }

        res.json({
            success: true,
            message: 'Successfully retrieved receipt',
            data: { receipt }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to retrieve receipt',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


// Get all receipts for the authenticated user
export const getUserReceiptHistory = async (req, res) => {
    try {
        const { userId } = req.user;
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;

        console.log(`Fetching receipt history for user: ${userId}`);

        // Get user receipts from DynamoDB
        const receipts = await getUserReceipts(userId, limit + offset);
        console.log("Found receipts");
        console.log(receipts);

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
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
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

        console.log(`Fetching receipt: ${receiptId} for user: ${userId}`);

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
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get all receipts (admin function - all receipts in your QUT namespace)
export const getAllReceipts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        
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
                qutUsername: process.env.QUT_USERNAME || "n12112798@qut.edu.au"
            }
        });

    } catch (error) {
        console.error('Error getting all receipts:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to retrieve all receipts',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};