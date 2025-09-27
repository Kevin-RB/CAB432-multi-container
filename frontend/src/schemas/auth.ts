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

export const OTPConfirmationSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
})

// Base authentication response
const baseAuthResponseSchema = z.object({
  message: z.string(),
})

// MFA Setup response (first time)
export const mfaSetupResponseSchema = baseAuthResponseSchema.extend({
  challengeName: z.literal('MFA_SETUP'),
  otpauth: z.string(),
  userIdForSRP: z.string(),
  session: z.string(),
})

// MFA Code required response (existing users)
export const mfaCodeRequiredResponseSchema = baseAuthResponseSchema.extend({
  challengeName: z.literal('SOFTWARE_TOKEN_MFA'),
  session: z.string(),
  userIdForSRP: z.string(),
})

// Union of all possible authentication responses
export const authResponseSchema = z.discriminatedUnion('challengeName', [
  mfaSetupResponseSchema,
  mfaCodeRequiredResponseSchema,
])

// Success authentication response
export const successAuthResponseSchema = baseAuthResponseSchema.extend({
  username: z.string(),
  roles: z.array(z.string()),
  idToken: z.string()
})

export type SuccessAuthResponseType = z.infer<typeof successAuthResponseSchema>
export type AuthResponseType = z.infer<typeof authResponseSchema>
export type MfaSetupResponseType = z.infer<typeof mfaSetupResponseSchema>
export type MfaCodeRequiredResponseType = z.infer<typeof mfaCodeRequiredResponseSchema>
export type OTPConfirmationType = z.infer<typeof OTPConfirmationSchema>
export type LoginSchema = z.infer<typeof loginSchema>
export type SignupSchema = z.infer<typeof signupSchema>