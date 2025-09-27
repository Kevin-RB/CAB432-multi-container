import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { QRCode } from "@/components/ui/kibo-ui/qr-code";
import { OTPForm } from '@/components/otp-form';
import { useMfaSetup } from '@/hooks/use-login';
import type { SubmitHandler } from 'react-hook-form';
import { mfaSetupResponseSchema, successAuthResponseSchema, type OTPConfirmationType } from '@/schemas/auth';
import { storeUserInfo } from '@/lib/store';

const searchSchema = mfaSetupResponseSchema.pick({ userIdForSRP: true, otpauth: true, session: true });

export const Route = createFileRoute('/(auth)/auth/totp-confirm')({
    component: RouteComponent,
    validateSearch: searchSchema
})

function RouteComponent() {
    const { otpauth, session, userIdForSRP } = Route.useSearch()
    const navigate = useNavigate({ from: '/auth/totp-confirm' })
    const totpMutation = useMfaSetup()

    const onSubmit: SubmitHandler<OTPConfirmationType> = async (data) => {
        console.log("Submitting TOTP code");
        try {
            const response = await totpMutation.mutateAsync({ authCode: data.pin, session, userIdForSRP });
            console.log("TOTP submission response:", response);
            const verifiedResult = successAuthResponseSchema.safeParse(response);

            if (!verifiedResult.success) {
                console.error("Response validation failed:", verifiedResult.error);
                return;
            }

            const { roles, idToken } = verifiedResult.data
            storeUserInfo(idToken, roles)

            navigate({ to: '/app' });
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
                    isPending={totpMutation.isPending}
                    isError={totpMutation.isError}
                    errorMessage={totpMutation.error?.message}
                />
                <div className="flex flex-col items-center mt-10">
                    <QRCode data={otpauth} className='size-40' />
                    <span className="mt-4 text-sm text-gray-500">Use an authenticator app like Google Authenticator or Authy.</span>
                </div>
            </div>
        </section>
    )
}
