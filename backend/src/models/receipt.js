import { z } from 'zod';

// Zod schema for receipt parsing validation
const receiptSchema = z.object({
    store_name: z.string(),
    items: z.array(z.object({
        item_name: z.string(),
        quantity: z.number().default(1).nullish(),
        price_per_unit: z.number().nullish(),
        total: z.number()
    })),
    subtotal: z.number()
});

const receiptJSONschema = z.toJSONSchema(receiptSchema);

export { receiptSchema, receiptJSONschema };

