import type { ReceiptItemSchema } from "@/schemas/receipt";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";


const columnHelper = createColumnHelper<ReceiptItemSchema>()

export const receiptDetailColumns = [
    columnHelper.accessor('item_name', {
        header: 'Item',
        cell: info => info.getValue()
    }),
    columnHelper.accessor('quantity', {
        header: 'Quantity',
        cell: info => info.getValue()
    }),
    columnHelper.accessor('price_per_unit', {
        header: 'Price per Unit',
        cell: info => info.getValue()
    }),
    columnHelper.accessor('total', {
        header: 'Total',
        cell: info => info.getValue()
    })
] as Array<ColumnDef<ReceiptItemSchema>>