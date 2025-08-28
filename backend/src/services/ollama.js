import { Ollama } from 'ollama'
import os from 'os';
import config from '../config/index.js';
import { receiptJSONschema, recipeJSONschema } from '../models/receipt.js';

const ollama = new Ollama({ host: config.services.ollama.baseUrl })

export default ollama

export const extractReceiptInfo = (receiptPlainText) => {
    const options = {
        ...config.ollama.options.deterministic,
        num_thread: os.cpus().length,
    };

    const llmResponse = ollama.generate({
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
        model: config.ollama.model,
        stream: false,
        format: receiptJSONschema,
        options: options
    })

    return llmResponse;
};


export const generateRecipeSuggestions = (ingredients) => {
    const options = {
        ...config.ollama.options.creative,
        num_thread: os.cpus().length,
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
        model: config.ollama.model,
        stream: false,
        format: recipeJSONschema,
        options: options
    })

    return llmResponse;
};
