import api from "@/lib/api";
import type { PaginatedReceiptSchema, ReceiptProcessSchema } from "@/schemas/receipt";
import { keepPreviousData, useQuery } from "@tanstack/react-query"

async function fetchReceiptData(page: number) {
    const response = await api.get<{
        success: boolean;
        message: string;
        data: PaginatedReceiptSchema;
    }>('/receipts', {
        params: {
            page
        }
    });
    return response.data;
}

export async function fetchReceipt(receiptId: string) {
    const response = await api.get(`/receipt/${receiptId}`);
    return response.data.data.receipt;
}

// Function to fetch image blob from the API
async function fetchReceiptImage(imageId: string) {
  const response = await api.get(`/upload/image/${imageId}`, {
    responseType: 'blob',
  });

  // Create object URL from blob
  return URL.createObjectURL(response.data);
}

export const useReceipt = ({page}: {page: number}) => {
    return useQuery<{message: string; data: PaginatedReceiptSchema, success: boolean}>({
        queryKey: ['receipts', page],
        queryFn: () => fetchReceiptData(page),
        placeholderData: keepPreviousData,
    })
}

export const useReceiptById = (receiptId: string) => {
    return useQuery<ReceiptProcessSchema>({
        queryKey: ['receipt', receiptId],
        queryFn: () => fetchReceipt(receiptId),
        staleTime: Infinity,
    })
}

export const useReceiptImage = (imageId: string) => {
    return useQuery({
        queryKey: ['receipt-image', imageId],
        queryFn: () => fetchReceiptImage(imageId),
        staleTime: Infinity,
        enabled: !!imageId,
      })
}