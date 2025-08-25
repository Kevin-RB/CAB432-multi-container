// Simple in-memory storage for processed receipts
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
 * Get all stored receipts
 * @returns {Array} - Array of all stored receipts
 */
export const getAllReceipts = (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Successfully retrieved all receipts',
            data: {
                receipts: receiptStorage,
                totalCount: receiptStorage.length
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