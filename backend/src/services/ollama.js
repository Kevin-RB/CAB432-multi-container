import { Ollama } from 'ollama'
import os from 'os';
import { z } from 'zod';

const ollama = new Ollama({ host: 'http://ollama:11434' })

export default ollama

// Zod schema for receipt parsing
const receiptSchema = z.object({
    store_name: z.string().nullish(),
    items: z.array(z.object({
        item_name: z.string().nullish(),
        quantity: z.number().default(1).nullish(),
        price_per_unit: z.number().nullish(),
        total: z.number().nullish()
    })),
    subtotal: z.number().nullish()
});

export const extractReceiptInfo = (receiptPlainText) => {
    const deterministicOptions = {
        temperature: 0,
        top_k: 1,           // Only most likely word
        top_p: 1.0,         // But allow full probability space
        repeat_penalty: 1.1,  // Light penalty to avoid repeating prices in item names
        num_thread: os.cpus().length,
    };

    const llmResponse = ollama.generate({
        prompt: `Parse this receipt OCR text and extract structured information. Clean up the data carefully.

                EXTRACTION RULES:
                - store_name: Extract the store/business name only
                - For each item:
                * item_name: Clean item name (remove prices, barcodes, codes, extra numbers)
                * quantity: Extract quantity/weight, set to 1 if not clear, null if completely unclear
                * price_per_unit: Unit price (per item or per kg), null if unclear
                * total: Line total for that item, null if unclear
                - subtotal: Sum of all item totals (before tax), null if not found

                CLEANING EXAMPLES:
                - "Dairyworks Cheese Slices Cheddar 5009 7.38" → name: "Dairyworks Cheese Slices Cheddar"
                - "#L$ Broad-Spectrum Probiotic 99pk 42.00" → name: "Broad-Spectrum Probiotic"
                - "Banana Cavendish 0.912kg @ $4.50/kg = $4.10" → name: "Banana Cavendish", quantity: 0.912

                Return null for any field you cannot determine confidently.

                REQUIRED OUTPUT FORMAT (follow exactly):
                    {
                    "store_name": "store name or null",
                    "items": [
                        {
                        "name": "clean item name",
                        "quantity": 1.5,
                        "price_per_unit": 3.99,
                        "total": 5.99
                        }
                    ],
                    "subtotal": 123.45
                    }

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
        model: 'gemma3:1b',
        stream: false,
        format: receiptSchema,
        options: deterministicOptions
    })

    return llmResponse;
};
