import { Ollama } from 'ollama'
import { receiptJSONschema, recipeJSONschema } from './models/receipt.js';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://ollama:11434';

const ollama = new Ollama({
    host: OLLAMA_URL,
    timeout: 300000
})

export default ollama

const ollamaOptions = {
    model: 'gemma3:1b',
    options: {
        deterministic: {
            temperature: 0,
            top_k: 1,
            top_p: 1.0,
            repeat_penalty: 1.1
        },
        creative: {
            temperature: 0.7,
            top_k: 40,
            top_p: 0.9,
        }
    }
}

export const extractReceiptInfo = (receiptPlainText) => {
    const options = {
        ...ollamaOptions.options.deterministic,
        num_thread: 8,  // Force Ollama to use 8 threads (adjust based on instance size)
    };

    const llmResponse = ollama.generate({
        system: `You are a helpful assistant that extracts structured data from OCR text of shopping receipts. Follow the extraction and cleaning rules carefully to ensure accurate and clean data.`,
        prompt: `Parse this receipt OCR text and extract structured information. Clean up the data carefully.

                EXTRACTION RULES:
                - store_name: Extract the store/business name only. leave the field as empty string if not found
                - For each item:
                * item_name: Clean item name (remove prices, barcodes, codes, extra numbers)
                * quantity: Extract quantity/weight, set to 1 if not clear, null if completely unclear
                * price_per_unit: Unit price (per item or per kg), null if unclear
                * total: Line total for that item, null if unclear
                - subtotal: Sum of all item totals (before tax), null if not found
                - recepies: List of 1 to 3 recipe suggestions based on the items purchased, null if no items found

                CLEANING EXAMPLES:
                - "Dairyworks Cheese Slices Cheddar 5009 7.38" → name: "Dairyworks Cheese Slices Cheddar"
                - "#L$ Broad-Spectrum Probiotic 99pk 42.00" → name: "Broad-Spectrum Probiotic"
                - "Banana Cavendish 0.912kg @ $4.50/kg = $4.10" → name: "Banana Cavendish", quantity: 0.912

                Return null for any field you cannot determine confidently.

                RULES:
                - Only return the JSON object above, nothing else
                - Do NOT add extra fields like store_address, zip_code, etc.
                - Do NOT wrap in a "RECEIPT" object
                - Clean item names: remove OCR artifacts, codes, and garbled text
                - Convert string numbers to actual numbers
                - Use null for missing data

                RECEIPT OCR TEXT:
                ${receiptPlainText}

                Extract the data as JSON:`,
        model: ollamaOptions.model,
        stream: false,
        format: receiptJSONschema,
        options: options
    })

    return llmResponse;
};


export const generateRecipeSuggestions = (ingredients) => {
    const options = {
        ...ollamaOptions.options.creative,
        num_thread: 8,  // Force high CPU usage
    };

    const llmResponse = ollama.generate({
        prompt: `Based on the following list of ingredients, generate 3 recipe suggestions:

                INGREDIENTS: ${ingredients}

                RULES:
                - No need to use all ingredients for a recipe, be creative, suggest recipes taking as a base some of the ingredients in the list.
                - Avoid using overly complex or rare ingredients.
                - Avoid using item brands, make or specific product names.
                - Suggest existing recipes that could be made with the ingredients.
                - Return a JSON object with a single key "recipes".
                - The value of "recipes" should be a list of strings, with each string being a recipe name.
                - Do NOT include any other text, explanation, or notes.
                - If no items are provided, return an empty list.
                - Keep the recipe names short and descriptive.

                Return the suggestions as a JSON array of strings:`,
        model: ollamaOptions.model,
        stream: false,
        format: recipeJSONschema,
        options: options
    })

    return llmResponse;
};
