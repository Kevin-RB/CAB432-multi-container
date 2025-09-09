import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { OTPConfirmationSchema, type OTPConfirmationType } from '@/schemas/auth'
import { useRef } from 'react'
import { useConfirmSignup } from "@/hooks/use-signup"
import { Spinner } from "./ui/kibo-ui/spinner"


export function OTPForm() {
    const formRef = useRef<HTMLFormElement>(null)
    const confirmationMutation = useConfirmSignup()

    const form = useForm<OTPConfirmationType>({
        resolver: zodResolver(OTPConfirmationSchema),
        defaultValues: {
            pin: "",
        },
    })

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
            await confirmationMutation.mutateAsync({ username, email, code: data.pin });
        } catch (error) {
            console.error("Error during OTP submission:", error);
        }
    }
    return (
        <Form  {...form}>
            <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="pin"
                    render={({ field }) => (
                        <FormItem className="space-y-3 place-items-center">
                            <FormControl>
                                <InputOTP disabled={confirmationMutation.isPending} {...field} onComplete={() => { formRef.current?.requestSubmit() }} maxLength={6}>
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                    </InputOTPGroup>
                                    <InputOTPSeparator />
                                    <InputOTPGroup>
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                            </FormControl>
                            {confirmationMutation.isError ? (
                                <FormMessage>
                                    {confirmationMutation.error.response?.data.error || 'An error occurred. Please try again.'}
                                </FormMessage>
                            ) : <FormMessage />}
                            {confirmationMutation.isPending && <span className="w-full flex items-center justify-center"><Spinner /></span>}
                            <FormDescription>
                                Enter the 6-digit code we sent to your email.
                            </FormDescription>
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    )
}