import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm, type SubmitHandler } from "react-hook-form"
import { loginSchema, type LoginSchema } from "@/schemas/auth"
import { zodResolver } from '@hookform/resolvers/zod'
import { useLogin } from "@/hooks/use-login"
import { Link } from "@tanstack/react-router"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const loginMutation = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginSchema> = async (data) => {
    try {
      // Call the login mutation
      await loginMutation.mutateAsync(data);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="username">Username</Label>
          <Input id="username" type="text" {...register("username")} />
          {errors.username && <p className="text-red-500">{errors.username.message}</p>}
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input id="password" type="password" {...register("password")} />
          {errors.password && <p className="text-red-500">{errors.password.message}</p>}
        </div>
        <Button disabled={loginMutation.isPending} type="submit" className="w-full cursor-pointer">
          Login
        </Button>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link
          to="/signup"
          className="text-primary hover:underline"
        >
          Sign up
        </Link>
      </div>
    </form>
  )
}
