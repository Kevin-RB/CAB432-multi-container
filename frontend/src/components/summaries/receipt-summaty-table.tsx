import { columns } from "./columns"
import { DataTable } from "./data-table"
import { useReceipt } from "@/hooks/use-receipt"

export default function ReceiptSummaryTable() {
    const { isPending, isError, data, error } = useReceipt();


    if (isPending) {
        return <div>Loading...</div>
    }

    if (isError) {
        return <div>Error: {error.message}</div>
    }
    return (
        <div className="container mx-auto py-10">
            <DataTable columns={columns} data={data} />
        </div>
    )
}