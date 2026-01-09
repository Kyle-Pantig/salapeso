'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

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
import { ArrowLeft, CheckCircle } from 'lucide-react'

const RESEND_COOLDOWN_SECONDS = 120 // 2 minutes

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resetToken, setResetToken] = useState('')
  const [sentEmail, setSentEmail] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

  // Start cooldown timer when code is first sent
  const startCooldown = useCallback(() => {
    setCooldownSeconds(RESEND_COOLDOWN_SECONDS)
  }, [])

  // Countdown effect
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds(cooldownSeconds - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldownSeconds])

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (formData: ForgotPasswordFormData) => {
    setError('')

    try {
      const result = await authApi.forgotPassword(formData.email) as { success: boolean; token?: string; error?: string }

      if (result.success && result.token) {
        setResetToken(result.token)
        setSentEmail(formData.email)
        setSuccess(true)
        startCooldown() // Start 2-minute cooldown
      } else {
        setError(result.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
  }

  const handleContinue = () => {
    router.push(`/reset-password?token=${encodeURIComponent(resetToken)}`)
  }

  const handleResend = async () => {
    if (cooldownSeconds > 0) return // Prevent resend during cooldown
    
    setIsResending(true)
    setError('')
    setResendSuccess(false)

    try {
      const result = await authApi.resendResetCode(resetToken)
      if (result.success) {
        setResendSuccess(true)
        startCooldown() // Restart 2-minute cooldown
        // Hide success message after 3 seconds
        setTimeout(() => setResendSuccess(false), 3000)
      } else {
        setError(result.error || 'Failed to resend code')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsResending(false)
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
              <h1 className="text-xl font-bold">Forgot your password?</h1>
              <FieldDescription>
                Enter your email and we&apos;ll send you a code to reset your password.
              </FieldDescription>
            </div>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
              )}
            </Field>

            {error && (
              <p className="text-sm text-destructive text-center">
                {error}
              </p>
            )}

            <Field>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Reset Code'}
              </Button>
            </Field>

            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Log In
              </Link>
            </div>
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
            <h1 className="text-xl font-bold">Check your email</h1>
            <FieldDescription>
              We&apos;ve sent a 6-digit code to <strong>{sentEmail}</strong>. Enter the code on the next page to reset your password.
            </FieldDescription>
          </div>

          <Field>
            <Button onClick={handleContinue} className="w-full">
              Enter Reset Code
            </Button>
          </Field>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <FieldDescription className="text-center">
            {resendSuccess ? (
              <span className="text-green-600">New code sent! Check your email.</span>
            ) : cooldownSeconds > 0 ? (
              <span className="text-muted-foreground">
                Resend code in {formatTime(cooldownSeconds)}
              </span>
            ) : (
              <>
                Didn&apos;t receive the email?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-primary hover:underline disabled:opacity-50"
                >
                  {isResending ? 'Sending...' : 'Resend'}
                </button>
              </>
            )}
          </FieldDescription>
        </FieldGroup>
      )}
    </div>
  )
}
