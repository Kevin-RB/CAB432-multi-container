import { z } from 'zod';

// Zod schema for receipt parsing validation
const receiptSchema = z.object({
    store_name: z.string().nullish(),
    items: z.array(z.object({
        item_name: z.string().nullish(),
        quantity: z.number().default(1).nullish(),
        price_per_unit: z.number().nullish(),
        total: z.number().nullish()
    })),
    subtotal: z.number().nullish(),
});


const receiptJSONschema = z.toJSONSchema(receiptSchema);

// Zod schema for recipe suggestions validation
const recipeSchema = z.array(z.string()).length(3);

const recipeJSONschema = z.toJSONSchema(recipeSchema);


export { receiptSchema, receiptJSONschema, recipeSchema, recipeJSONschema };