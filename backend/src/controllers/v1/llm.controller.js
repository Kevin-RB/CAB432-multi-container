import config from "../../config/index.js";
import { recipeSchema } from "../../models/receipt.js";
import ollama, { generateRecipeSuggestions } from "../../services/ollama.js";

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
            model: config.ollama.model,
            prompt,
            stream: false,
        });

        return res.json(ollamaResponse);
    } catch (error) {
        console.error('Error generating response from Ollama:', error.message);
        res.status(500).json({ error: 'Failed to generate response from Ollama' });
    }
}

export const testGenerateRecipe = async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }
        const llmRecipeSuggestions = await generateRecipeSuggestions(prompt);

        const parsedSuggestions = JSON.parse(llmRecipeSuggestions.response);
        const suggestionValidation = recipeSchema.safeParse(parsedSuggestions);

        if (suggestionValidation.error) {
            console.log(suggestionValidation.error);
            // Clean up file on validation failure
            cleanupFile(file.path);
            throw new Error(`Recipe suggestion validation failed: ${suggestionValidation.error}`);
        }

        return res.json({ success: true, data: suggestionValidation.data });
    } catch (error) {
        console.error('Error generating recipe suggestions:', error.message);
        res.status(500).json({ error: 'Failed to generate recipe suggestions' });
    }

}