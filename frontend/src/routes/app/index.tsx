import ReceiptSummaryTable from '@/components/summaries/receipt-summaty-table'
import { UploadForm } from '@/components/upload-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/')({
  component: App,
})


function App() {
  return (
    <div className='w-full flex flex-col items-center gap-10 p-4'>
      <UploadForm />
      <ReceiptSummaryTable />
    </div>
  )
}
