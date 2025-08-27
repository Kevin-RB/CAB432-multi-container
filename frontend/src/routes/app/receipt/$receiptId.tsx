import { ReceiptDetailTable } from '@/components/receipt-details/receipt-detail-table'
import ReceiptImage from '@/components/receipt-details/receipt-image'
import api from '@/lib/api'
import type { ReceiptProcessSchema } from '@/schemas/receipt'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/receipt/$receiptId')({
    // In a loader
    loader: ({ params }) => api.get(`/receipt/${params.receiptId}`),
    // Or in a component
    component: ReceiptComponent,
})

function ReceiptComponent() {
    // In a component!
    const receiptData = Route.useLoaderData()

    if (receiptData.statusText !== "OK") return <div>Something went wrong...</div>

    const { data }: ReceiptProcessSchema = receiptData.data.data.receipt

    return (
        <section className="container mx-auto p-4 grid grid-cols-1 gap-4">
            <h1 className="text-4xl font-bold mb-4">{data.fileInfo.originalName}</h1>
            <h2 className="text-xl font-bold">Receipt Details</h2>
            <ReceiptDetailTable data={data.receiptData.items} />
            <span className="font-bold">Subtotal: {data.receiptData.subtotal}</span>
            <ReceiptImage className='max-w-3xl mx-auto' imageId={data.fileInfo.savedAs} alt={data.fileInfo.originalName} />
        </section>
    )
}