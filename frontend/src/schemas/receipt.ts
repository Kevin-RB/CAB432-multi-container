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