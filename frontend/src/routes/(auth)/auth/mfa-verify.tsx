import { OTPForm } from '@/components/otp-form'
import { useConfirmMfa } from '@/hooks/use-login';
import { mfaCodeRequiredResponseSchema, type OTPConfirmationType } from '@/schemas/auth';
import { createFileRoute } from '@tanstack/react-router'
import type { SubmitHandler } from 'react-hook-form';

const searchSchema = mfaCodeRequiredResponseSchema.pick({ userIdForSRP: true, session: true });

export const Route = createFileRoute('/(auth)/auth/mfa-verify')({
  component: RouteComponent,
  validateSearch: searchSchema
})

function RouteComponent() {
  const { session, userIdForSRP } = Route.useSearch()
  const mfaConfirmMutation = useConfirmMfa()

  const onSubmit: SubmitHandler<OTPConfirmationType> = async (data) => {
    console.log("Submitting TOTP code");
    try {
      await mfaConfirmMutation.mutateAsync({ authCode: data.pin, userIdForSRP, session });
    } catch (error) {
      console.error("Error during TOTP submission:", error);
    }
  }

  return (
    <section className="h-dvh mx-auto p-4 grid place-items-center">
      <div>
        <h2 className="text-2xl text-center font-bold my-4">Enter the code from your authenticator app</h2>
        <OTPForm
          onSubmit={onSubmit}
          isPending={mfaConfirmMutation.isPending}
          isError={mfaConfirmMutation.isError}
          errorMessage={mfaConfirmMutation.error?.message}
        />
      </div>
    </section>
  )
}
