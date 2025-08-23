import express from 'express';
import ollama from '../services/ollama.js';

const router = express.Router();

router.get('/models', async (req, res) => {
    try {
        const ollamaModels = await ollama.list();
        return res.json(ollamaModels);
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

        const ollamaModels = await ollama.generate({
            model: "gemma3:1b",
            prompt: req.body.prompt,
            stream: false,
        });

        return res.json(ollamaModels);
    } catch (error) {
        console.error('Error fetching Ollama models:', error.message);
        res.status(500).json({ error: 'Failed to fetch Ollama models' });
    }
});

export default router;
