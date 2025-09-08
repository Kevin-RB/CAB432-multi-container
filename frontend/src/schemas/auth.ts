import {z} from "zod"

export const loginSchema = z.object({
  username: z.string().nonempty("Username is required"),
  password: z.string().nonempty("Password is required"),
})

export const signupSchema = loginSchema.extend({
  email: z.email("Invalid email address"),
  password: z.string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[0-9]/, "Password must contain at least one number")        // at least one number
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")        // at least one uppercase letter
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")        // at least one lowercase letter
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one symbol") // at least one symbol
})

export type LoginSchema = z.infer<typeof loginSchema>
export type SignupSchema = z.infer<typeof signupSchema>