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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { OTPConfirmationSchema, type OTPConfirmationType } from '@/schemas/auth'
import { useRef } from 'react'
import { Spinner } from "./ui/kibo-ui/spinner"


export function OTPForm({ onSubmit, isPending, isError, errorMessage }: { onSubmit: (data: OTPConfirmationType) => void, isPending?: boolean, isError?: boolean, errorMessage?: string }) {
    const formRef = useRef<HTMLFormElement>(null)

    const form = useForm<OTPConfirmationType>({
        resolver: zodResolver(OTPConfirmationSchema),
        defaultValues: {
            pin: "",
        },
    })

    return (
        <Form  {...form}>
            <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="pin"
                    render={({ field }) => (
                        <FormItem className="space-y-3 place-items-center">
                            <FormControl>
                                <InputOTP disabled={isPending} {...field} onComplete={() => { formRef.current?.requestSubmit() }} maxLength={6}>
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
                            {isError ? (
                                <FormMessage>
                                    {errorMessage || 'An error occurred. Please try again.'}
                                </FormMessage>
                            ) : <FormMessage />}
                            {isPending && <span className="w-full flex items-center justify-center"><Spinner /></span>}
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