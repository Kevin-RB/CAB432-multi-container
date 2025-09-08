import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSignup } from '@/hooks/use-signup'
import { cn } from '@/lib/utils'
import { signupSchema, type SignupSchema } from '@/schemas/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { useForm, type SubmitHandler } from 'react-hook-form'

export function SignupForm({
    className,
    ...props
}: React.ComponentProps<"form">) {
    const signupMutation = useSignup();
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(signupSchema)
    })

    const onSubmit: SubmitHandler<SignupSchema> = async (data) => {
        try {
            // Call the signup mutation
            await signupMutation.mutateAsync(data);
        } catch (error) {
            console.error("Signup failed:", error);
        }
    }

    return (
        <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Start your journey</h1>
                <p className="text-muted-foreground text-sm text-balance">
                    Enter your username, email and password to create your account
                </p>
            </div>
            <div className="grid gap-6">
                <div className="grid gap-3">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" type="text" {...register("username")} />
                    {errors.username && <p className="text-red-500">{errors.username.message}</p>}
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register("email")} />
                    {errors.email && <p className="text-red-500">{errors.email.message}</p>}
                </div>
                <div className="grid gap-3">
                    <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                    </div>
                    <Input id="password" type="password" {...register("password")} />
                    {errors.password && <p className="text-red-500">{errors.password.message}</p>}
                </div>
                <Button disabled={signupMutation.isPending} type="submit" className="w-full cursor-pointer">
                    Create Account
                </Button>
            </div>
            <div className="text-center text-sm">
                Already have an account?{" "}
                <Link
                    to="/"
                    className='text-primary hover:underline'
                >
                    Login here
                </Link>
            </div>
        </form>
    )
}
