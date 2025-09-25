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

async function fetchReceiptImage(imageKey: string) {
    const response = await api.get(`/receipts/image`, {
        params: {
            s3key: imageKey
        },
        responseType: 'json',
     });
    // Create object URL from blob
    return response.data;
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

export const useReceiptImage = (imageKey: string) => {
    return useQuery<{success: boolean; message: string; data: {url:string, s3key:string}}>({
        queryKey: ['receipt-image', imageKey],
        queryFn: () => fetchReceiptImage(imageKey),
        staleTime: 55 * 60 * 1000, // 55 minutes (slightly less than URL expiration)
        enabled: !!imageKey,
        retry: 2,
      })
}