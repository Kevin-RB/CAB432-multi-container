import { Ollama } from 'ollama'
import os from 'os';
import config from '../config/index.js';
import { receiptJSONschema } from '../models/receipt.js';

const ollama = new Ollama({ host: config.services.ollama.baseUrl })

export default ollama

export const extractReceiptInfo = (receiptPlainText) => {
    const deterministicOptions = {
        ...config.ollama.options,
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
        options: deterministicOptions
    })

    return llmResponse;
};
