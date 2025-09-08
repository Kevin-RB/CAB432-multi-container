import { OTPForm } from '@/components/otp-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/signup/confirmation')({
  component: RouteComponent,
})

function RouteComponent() {


  return (
    <section className="grid place-items-center h-screen">
      <div className='flex flex-col items-center gap-2'>
        <h1 className="text-2xl font-bold mb-4">Email Confirmation</h1>
        <OTPForm />
      </div>
    </section >
  )
}
