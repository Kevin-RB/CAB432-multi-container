import {z} from "zod"

// Custom file validation that works with react-hook-form
const fileSchema = z
  .any()
  .refine((files) => files?.length >= 1, "A receipt image is required")
  .refine(
    (files) => files?.[0]?.size <= 5000000,
    "File size should be less than 5MB"
  )
  .refine(
    (files) => ["image/jpeg", "image/png", "image/jpg"].includes(files?.[0]?.type),
    "Only JPEG or PNG files are allowed"
  );

export const receiptUploadSchema = z.object({
  "receipt-image": fileSchema,
})
export type ReceiptUploadSchema = z.infer<typeof receiptUploadSchema>


export const receiptItemSchema = z.object({
  item_name: z.string(),
  quantity: z.number(),
  price_per_unit: z.number(),
  total: z.number()
})
export type ReceiptItemSchema = z.infer<typeof receiptItemSchema>

export const receiptListSchema = z.object({
  store_name: z.string(),
  items: z.array(receiptItemSchema),
  recipes: z.array(z.string()),
  subtotal: z.number()
})
export type ReceiptListSchema = z.infer<typeof receiptListSchema>


export const receiptProcessSchema = z.object({
  receiptId: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  status: z.string(),
  fileInfo: z.object({
    originalName: z.string(),
    mimeType: z.string(),
    size: z.number(),
  }),
  ocrResult: z.object({
    status: z.string(),
    text: z.string(),
    timestamp: z.number()
  }),
  viewUrl: z.string(),
  receiptData: receiptListSchema,
})

export type ReceiptProcessSchema = z.infer<typeof receiptProcessSchema>

export const paginationSchema = z.object({
    currentPage: z.number(),
    totalPages: z.number(),
    totalItems: z.number(),
    itemsPerPage: z.number(),
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
    nextPage: z.number().min(1).nullable(),
    previousPage: z.number().min(1).nullable()
})

export const paginatedReceiptSchema = z.object({
    receipts: z.array(receiptProcessSchema),
    pagination: paginationSchema
});

export type PaginatedReceiptSchema = z.infer<typeof paginatedReceiptSchema>;