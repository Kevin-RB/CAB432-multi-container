import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { TableActions } from "./actions";
import type { ReceiptProcessSchema } from "@/schemas/receipt";
import { formatCurrency } from "@/lib/currency";
import { isoDateToShortDate } from "@/lib/date";

const columnHelper = createColumnHelper<ReceiptProcessSchema>()

export const summaryColumns: ColumnDef<ReceiptProcessSchema>[] = [
    columnHelper.accessor('fileInfo.originalName', {
        header: 'Title',
        cell: info => info.getValue()
    }),
    columnHelper.accessor('status', {
        header: 'Status',
        cell: info => info.getValue()
    }),
    columnHelper.accessor('createdAt', {
        header: 'Created At',
        cell: info => {
            const date = info.getValue();
            if (!date) return 'Missing';

            const formatted = isoDateToShortDate(date);
            return <span>{formatted}</span>
        }
    }),
    columnHelper.accessor('receiptData.subtotal', {
        header: () => (<div className="text-right">Amount</div>),
        cell: info => {
            const subtotal = info.getValue() 
            if (!subtotal) return 'Missing';

            const formatted = formatCurrency(subtotal, 'AUD');
            return <div className="text-right font-medium">{formatted}</div>
        }
    }),
    columnHelper.display({
        id: 'actions',
        cell: ({ row }) => {
            const linkTo = `receipt/${row.original.receiptId}`
            return <TableActions linkTo={linkTo} />
        }
    }),
] as Array<ColumnDef<ReceiptProcessSchema>>