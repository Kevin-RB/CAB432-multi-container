import { SignupForm } from '@/components/signup-form'
import { createFileRoute } from '@tanstack/react-router'
import { Receipt } from 'lucide-react'


export const Route = createFileRoute('/(auth)/signup/')({
    component: SignupPage,
})

function SignupPage() {
    return (
        <div className="grid min-h-svh">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <a href="#" className="flex items-center gap-2 font-medium">
                        <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                            <Receipt className="size-4" />
                        </div>
                        Cosmic receipt
                    </a>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <SignupForm />
                    </div>
                </div>
            </div>
        </div>
    )
}

