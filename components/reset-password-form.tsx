'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { cn } from "@/lib/utils"
import { authApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react'

const resetPasswordSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

interface ResetPasswordFormProps extends React.ComponentProps<"div"> {
  token: string
}

export function ResetPasswordForm({
  className,
  token,
  ...props
}: ResetPasswordFormProps) {
  const [success, setSuccess] = useState(false)
  const [codeVerified, setCodeVerified] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifiedCode, setVerifiedCode] = useState('') // Track which code was already attempted
  const [codeError, setCodeError] = useState(false) // For input styling only
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      code: '',
      password: '',
      confirmPassword: '',
    },
  })

  const code = watch("code")

  // Clear error styling when user starts typing a different code
  useEffect(() => {
    if (code !== verifiedCode && codeError) {
      setCodeError(false)
    }
  }, [code, verifiedCode, codeError])

  // Auto-verify code when 6 digits entered
  useEffect(() => {
    // Only verify if: 6 digits, not already verified, not currently verifying, and code is different from last attempt
    if (code?.length === 6 && !codeVerified && !isVerifying && code !== verifiedCode) {
      verifyCode(code)
    }
  }, [code, codeVerified, isVerifying, verifiedCode])

  const verifyCode = async (codeValue: string) => {
    setIsVerifying(true)
    setCodeError(false)
    setVerifiedCode(codeValue) // Mark this code as attempted

    try {
      const result = await authApi.verifyResetCode(token, codeValue)
      if (result.success) {
        setCodeVerified(true)
        toast.success('Code verified!', {
          description: 'Now set your new password.',
        })
      } else {
        setCodeError(true)
        toast.error('Invalid code', {
          description: result.error || 'Please check your code and try again.',
        })
      }
    } catch {
      setCodeError(true)
      toast.error('Something went wrong', {
        description: 'Please try again later.',
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const onSubmit = async (formData: ResetPasswordFormData) => {
    try {
      const result = await authApi.resetPassword(token, formData.code, formData.password)

      if (result.success) {
        setSuccess(true)
        toast.success('Password reset successful!', {
          description: 'You can now log in with your new password.',
        })
      } else {
        toast.error('Failed to reset password', {
          description: result.error || 'Please try again.',
        })
      }
    } catch {
      toast.error('Something went wrong', {
        description: 'Please try again later.',
      })
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {!success ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center">
              <Link href="/" className="mb-2">
                <Image
                  src="/salapeso-logo.png"
                  alt="SalaPeso"
                  width={160}
                  height={45}
                  priority
                />
              </Link>
              <h1 className="text-xl font-bold">Reset your password</h1>
              <FieldDescription>
                {codeVerified 
                  ? "Enter your new password below."
                  : "Enter the 6-digit code sent to your email."
                }
              </FieldDescription>
            </div>

            {!codeVerified && (
              <Field>
                <FieldLabel htmlFor="code">Reset Code</FieldLabel>
                <Input
                  id="code"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  autoComplete="off"
                  {...register('code')}
                  disabled={isSubmitting}
                  className={cn(
                    "text-center text-2xl tracking-widest font-mono",
                    codeError && "border-destructive ring-destructive focus-visible:ring-destructive"
                  )}
                  aria-invalid={!!errors.code || codeError}
                />
                {isVerifying && (
                  <p className="text-sm text-muted-foreground flex items-center justify-center mt-1">
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Verifying...
                  </p>
                )}
                {errors.code && (
                  <p className="text-sm text-destructive mt-1">{errors.code.message}</p>
                )}
              </Field>
            )}

            {codeVerified && (
              <>
                <Field>
                  <FieldLabel htmlFor="password">New Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="off"
                      {...register('password')}
                      disabled={isSubmitting}
                      aria-invalid={!!errors.password}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="off"
                      {...register('confirmPassword')}
                      disabled={isSubmitting}
                      aria-invalid={!!errors.confirmPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>
                  )}
                </Field>
              </>
            )}

            {codeVerified && (
              <Field>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </Button>
              </Field>
            )}

          </FieldGroup>
        </form>
      ) : (
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Link href="/" className="mb-2">
              <Image
                src="/salapeso-logo.png"
                alt="SalaPeso"
                width={160}
                height={45}
                priority
              />
            </Link>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="text-xl font-bold">Password reset!</h1>
            <FieldDescription>
              Your password has been successfully reset. You can now log in with your new password.
            </FieldDescription>
          </div>

          <Field>
            <Link href="/login">
              <Button className="w-full">Go to Log In</Button>
            </Link>
          </Field>
        </FieldGroup>
      )}
    </div>
  )
}
