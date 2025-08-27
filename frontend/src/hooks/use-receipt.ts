import api from "@/lib/api";
import type { ReceiptProcessSchema } from "@/schemas/receipt";
import { useQuery } from "@tanstack/react-query"

async function fetchReceiptData() {
    const response = await api.get('/receipt');
    return response.data.data.receipts;
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

export const useReceipt = () => {
    return useQuery<ReceiptProcessSchema[]>({
        queryKey: ['receipts'],
        queryFn: fetchReceiptData,
        staleTime: Infinity,
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