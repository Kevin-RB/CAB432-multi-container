import api from "@/lib/api";
import type { ReceiptProcessSchema } from "@/schemas/receipt";
import { useQuery } from "@tanstack/react-query"

async function fetchReceiptData() {
    // Fetch data from your API here.
    const response = await api.get('/receipt');
    return response.data.data.receipts;
}

export async function fetchReceipt(receiptId: string) {
    const response = await api.get(`/receipt/${receiptId}`);
    return response.data.data.receipt;
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
