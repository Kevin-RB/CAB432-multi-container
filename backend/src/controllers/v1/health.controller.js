import axios from 'axios';
import config from '../../config/index.js';

export const checkHealth = async (req, res) => {
    console.log('Health check endpoint hit');

    try {
        // Check tesseract service health
        const tesseractResponse = await axios.get(`${config.services.tesseract.baseUrl}/health`);
        console.log('Tesseract service response:', tesseractResponse.data);

        res.json({
            message: 'File Upload API is running!',
            status: 'healthy',
            services: {
                tesseract: {
                    status: 'connected',
                    response: tesseractResponse.data
                }
            },
            endpoints: {
                upload: 'POST /upload - Upload an image or PDF file',
                ollama: 'POST /ollama/generate - Generate text with Ollama'
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Failed to connect to tesseract service:', error.message);

        res.status(503).json({
            message: 'File Upload API is running!',
            status: 'degraded',
            services: {
                tesseract: {
                    status: 'disconnected',
                    error: error.message
                }
            },
            endpoints: {
                upload: 'POST /upload - Upload an image or PDF file',
                ollama: 'POST /ollama/generate - Generate text with Ollama'
            },
            timestamp: new Date().toISOString()
        });
    }
}