import type { ColumnDef } from "@tanstack/react-table";
import { TableActions } from "./actions";
import type { ReceiptProcessSchema } from "@/schemas/receipt";

export const columns: ColumnDef<ReceiptProcessSchema>[] = [
    {
        accessorKey: "data.fileInfo.originalName",
        header: "Original Name",
    },
    {
        accessorKey: "data.receiptData.store_name",
        header: "Store Name",
    },
    {
        accessorKey: "data.receiptData.subtotal",
        header: () => (<div className="text-right">Amount</div>),
        cell: ({ row }) => {
            const amount = parseFloat(row.original.data.receiptData.subtotal.toString())
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(amount)

            return <div className="text-right font-medium">{formatted}</div>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const linkTo = `receipt/${row.original.id}`
            return <TableActions linkTo={linkTo} />
        },
    },
]