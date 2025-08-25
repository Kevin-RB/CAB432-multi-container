import ollama from "../../services/ollama.js";

export const getModelList = async (req, res) => {
    try {
        const ollamaModels = await ollama.list();
        return res.json(ollamaModels);
    } catch (error) {
        console.error('Error fetching Ollama models:', error.message);
        res.status(500).json({ error: 'Failed to fetch Ollama models' });
    }
}

export const generateResponse = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const ollamaResponse = await ollama.generate({
            model: "gemma3:1b",
            prompt,
            stream: false,
        });

        return res.json(ollamaResponse);
    } catch (error) {
        console.error('Error generating response from Ollama:', error.message);
        res.status(500).json({ error: 'Failed to generate response from Ollama' });
    }
}
