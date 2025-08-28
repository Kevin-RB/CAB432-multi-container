import { DUMMY_DATA } from "../../.data.test/dummy.js";

// Simple in-memory storage for processed receipts
// let receiptStorage = [DUMMY_DATA, DUMMY_DATA, DUMMY_DATA, DUMMY_DATA, DUMMY_DATA, DUMMY_DATA, DUMMY_DATA, DUMMY_DATA, DUMMY_DATA, DUMMY_DATA];
let receiptStorage = [];

/**
 * Add a processed receipt to storage
 * @param {Object} receiptData - The processed receipt data
 * @returns {Object} - The stored receipt with added metadata
 */
export const addToStorage = (receiptData) => {
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


export const getPaginatedReceipts = (req, res) => {
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
export const getReceiptById = (req, res) => {
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

/**
 * Clear all stored receipts
 */
export const clearStorage = (req, res) => {
    try {
        const previousCount = receiptStorage.length;
        receiptStorage = [];

        res.json({
            success: true,
            message: 'Successfully cleared receipt storage',
            data: {
                previousCount,
                currentCount: 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to clear storage',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};