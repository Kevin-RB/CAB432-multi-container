import { summaryColumns } from "./columns"
import { useReceipt } from "@/hooks/use-receipt"
import { DataTablePaginated } from "./data-table-paginated";
import { useState } from "react";
import { Button } from "../ui/button";

export default function ReceiptSummaryTable() {
    const [pagination, setPagination] = useState({
        pageIndex: 1, //initial page index
        pageSize: 3, //default page size
    });
    const { isPending, isError, data, error, isPlaceholderData } = useReceipt({ page: pagination.pageIndex });

    if (isPending) {
        return <div>Loading...</div>
    }

    if (isError) {
        return <div>Error: {error.message}</div>
    }

    const { data: receiptData } = data;

    return (
        <div className="container mx-auto max-w-xl py-10">
            <DataTablePaginated
                columns={summaryColumns}
                data={receiptData.receipts}
                options={{
                    rowCount: receiptData.pagination.itemsPerPage,
                }}
            />
            <div className="flex justify-between py-4">
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Page {receiptData.pagination.currentPage} of{" "}
                    {receiptData.pagination.totalPages}
                </div>
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPagination((old) => ({ ...old, pageIndex: Math.max(old.pageIndex - 1, 1) }))}
                        disabled={!receiptData.pagination.hasPreviousPage}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            if (!isPlaceholderData && receiptData.pagination.hasNextPage) {
                                setPagination((old) => ({ ...old, pageIndex: old.pageIndex + 1 }))
                            }
                        }}
                        // Disable the Next Page button until we know a next page is available
                        disabled={isPlaceholderData || !receiptData?.pagination.hasNextPage}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}