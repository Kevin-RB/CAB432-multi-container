import { OTPForm } from '@/components/otp-form'
import { useConfirmSignup } from '@/hooks/use-signup'
import type { OTPConfirmationType } from '@/schemas/auth'
import { createFileRoute } from '@tanstack/react-router'
import type { SubmitHandler } from 'react-hook-form'

export const Route = createFileRoute('/(auth)/signup/confirmation')({
  component: RouteComponent,
})

function RouteComponent() {
  const confirmationMutation = useConfirmSignup()

  const onSubmit: SubmitHandler<OTPConfirmationType> = async (data) => {
    const user = sessionStorage.getItem('pendingUser')
    if (!user) {
      throw new Error("Something went wrong. Please restart the signup process.");
    }
    try {
      const { username, email } = JSON.parse(user);
      if (!username) {
        throw new Error("No pending username found in sessionStorage.");
      }
      await confirmationMutation.mutateAsync({ username, email, code: data.pin })
    } catch (error) {
      console.error("Error during OTP submission:", error);
    }
  }

  return (
    <section className="grid place-items-center h-screen">
      <div className='flex flex-col items-center gap-2'>
        <h1 className="text-2xl font-bold mb-4">Email Confirmation</h1>
        <OTPForm
          onSubmit={onSubmit}
          isPending={confirmationMutation.isPending}
          isError={confirmationMutation.isError}
          errorMessage={confirmationMutation.error?.message}
        />
      </div>
    </section >
  )
}
