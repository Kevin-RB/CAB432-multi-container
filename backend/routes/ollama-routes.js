import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/models', async (req, res) => {
    try {
        const ollamaModels = await axios.get('http://ollama:11434/api/tags');
        if (ollamaModels.statusText !== 'OK') {
            throw new Error('Failed to fetch Ollama models');
        }

        return res.json(ollamaModels.data);
    } catch (error) {
        console.error('Error fetching Ollama models:', error.message);
        res.status(500).json({ error: 'Failed to fetch Ollama models' });
    }
});

router.post('/generate', async (req, res) => {
    try {
        if (!req.body?.prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const ollamaModels = await axios.post('http://ollama:11434/api/generate', {
            model: "gemma3:1b",
            prompt: req.body.prompt,
            stream: false
        });

        if (ollamaModels.statusText !== 'OK') {
            throw new Error('Failed to fetch Ollama models');
        }

        return res.json(ollamaModels.data);
    } catch (error) {
        console.error('Error fetching Ollama models:', error.message);
        res.status(500).json({ error: 'Failed to fetch Ollama models' });
    }
});

export default router;
