import type { ReceiptItemSchema } from "@/schemas/receipt";
import { receiptDetailColumns } from "./columns";
import { DataTable } from "../summaries/data-table";

export const ReceiptDetailTable = ({ data }: { data: ReceiptItemSchema[] }) => {
    return (
        <DataTable data={data} columns={receiptDetailColumns} />
    );
}