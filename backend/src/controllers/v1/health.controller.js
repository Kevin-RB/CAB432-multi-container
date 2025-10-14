// health.controller.js

export const checkHealth = async (req, res) => {
    console.log('Health check endpoint hit');
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'cosmic-receipt-backend',
        version: 'v1'
    });
}