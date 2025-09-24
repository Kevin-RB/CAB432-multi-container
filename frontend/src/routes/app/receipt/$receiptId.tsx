import { ReceiptDetailTable } from '@/components/receipt-details/receipt-detail-table'
// import ReceiptImage from '@/components/receipt-details/receipt-image'
import { VideoShowcase } from '@/components/receipt-details/videos/video-showcase'
import api from '@/lib/api'
import type { ReceiptProcessSchema } from '@/schemas/receipt'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/receipt/$receiptId')({
    // In a loader
    loader: ({ params }) => api.get(`/receipts/${params.receiptId}`),
    // Or in a component
    component: ReceiptComponent,
})

function ReceiptComponent() {
    const receiptData = Route.useLoaderData()

    if (receiptData.statusText !== "OK") return <div>Something went wrong...</div>

    const data: ReceiptProcessSchema = receiptData.data.data
    
    return (
        <section className="container mx-auto p-4 grid grid-cols-1 gap-8">
            <h1 className="text-4xl font-bold mb-4">{data.fileInfo.originalName}</h1>
            <h2 className="text-xl font-bold">Receipt Details</h2>
            <ReceiptDetailTable data={data.receiptData.items} />
            <span className="font-bold">Subtotal: {data.receiptData.subtotal}</span>

            <h3 className="text-lg font-bold">Recipe Suggestions</h3>
            <ul className='grid grid-cols-3 gap-2'>
                {data.receiptData.recipes.map((recipe) => (
                    <li className='flex items-center justify-center border p-4 text-center rounded-sm text-md font-medium' key={recipe}>{recipe}</li>
                ))}
            </ul>
            {data.receiptData.recipes.length > 0 && (
                <VideoShowcase recipes={data.receiptData.recipes} />
            )}
            <h3 className="text-lg font-bold">Original Receipt</h3>
            {/* <ReceiptImage className='max-w-3xl mx-auto' imageId={data.fileInfo.savedAs} alt={data.fileInfo.originalName} /> */}
            <div className='size-80 rounded-2xl bg-zinc-300 mx-auto grid place-items-center text-gray-600 text-center p-10'>
                Image feature coming soon!
            </div>
        </section>
    )
}