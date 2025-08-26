import type { ReceiptSummary } from "@/components/summaries/columns"
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query"

async function fetchReceiptData() {
    // Fetch data from your API here.
    const response = await api.get('/receipt');
    return response.data.data.receipts;
}

export const useReceipt = () => {
    return useQuery<ReceiptSummary[]>({
        queryKey: ['receipts'],
        queryFn: fetchReceiptData,
        staleTime: Infinity
    })
}