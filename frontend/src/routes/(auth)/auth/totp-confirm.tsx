import { createFileRoute } from '@tanstack/react-router'
import { QRCode } from "@/components/ui/kibo-ui/qr-code";
import { OTPForm } from '@/components/otp-form';
import { useMfaSetup } from '@/hooks/use-login';
import type { SubmitHandler } from 'react-hook-form';
import { mfaSetupResponseSchema, type OTPConfirmationType } from '@/schemas/auth';

const searchSchema = mfaSetupResponseSchema.pick({ userIdForSRP: true, otpauth: true, session: true });

export const Route = createFileRoute('/(auth)/auth/totp-confirm')({
    component: RouteComponent,
    validateSearch: searchSchema
})

function RouteComponent() {
    const { otpauth, session, userIdForSRP } = Route.useSearch()
    const totpMutation = useMfaSetup()
    console.log("TOTP Confirm Route loaded with otpauth:", otpauth);

    const decodedOtpauth = decodeURIComponent(otpauth);
    console.log("Decoded otpauth URL:", decodedOtpauth);

    const onSubmit: SubmitHandler<OTPConfirmationType> = async (data) => {
        console.log("Submitting TOTP code");
        try {
            await totpMutation.mutateAsync({ authCode: data.pin, session, userIdForSRP });
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
                    description='Enter the 6-digit code from your authenticator app.'
                />
                <div className="flex flex-col items-center mt-10">
                    <div className="w-64 h-64 bg-white p-4" >
                        <QRCode data={decodedOtpauth} background="#eee" foreground="#111" />
                    </div>
                    <span className="mt-4 text-sm text-gray-500">Use an authenticator app like Google Authenticator or Authy.</span>
                </div>
            </div>
        </section>
    )
}
