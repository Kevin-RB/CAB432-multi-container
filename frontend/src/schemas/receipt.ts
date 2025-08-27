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


export const receiptProcessSchema = z.object({
  id: z.string(),
  data: z.object({
    fileInfo: z.object({
      originalName: z.string(),
      savedAs: z.string(),
      filePath: z.string(),
      mimeType: z.string(),
      size: z.number(),
      sizeInMB: z.string(),
      uploadTime: z.string()
    }),
    ocrResult: z.object({
      status: z.string(),
      text: z.string(),
      timestamp: z.number()
    }),
    receiptData: z.object({
      store_name: z.string(),
      items: z.array(z.object({
        item_name: z.string(),
        quantity: z.number(),
        price_per_unit: z.number(),
        total: z.number()
      })),
      subtotal: z.number()
    }),
    processing: z.object({
      duration: z.string(),
      timestamp: z.string()
    })
  }),
  storedAt: z.string()
})

export type ReceiptProcessSchema = z.infer<typeof receiptProcessSchema>

export const receiptItemSchema = z.object({
  item_name: z.string(),
  quantity: z.number(),
  price_per_unit: z.number(),
  total: z.number()
})

export type ReceiptItemSchema = z.infer<typeof receiptItemSchema>

export const receiptListSchema = z.object({
  storeName: z.string(),
  items: z.array(receiptItemSchema),
  subtotal: z.number()
})

export type ReceiptListSchema = z.infer<typeof receiptListSchema>

