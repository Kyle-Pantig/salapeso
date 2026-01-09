'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { cn } from "@/lib/utils"
import { authApi } from "@/lib/api"
import { cookies } from "@/lib/cookies"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useGoogleOAuthConfig } from "@/components/providers/GoogleOAuthProvider"
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton"
import { signupSchema, SignupFormData } from "@/validations/users"
import { Eye, EyeOff, Mail, ArrowLeft } from 'lucide-react'

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const isGoogleConfigured = useGoogleOAuthConfig()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (formData: SignupFormData) => {
    const data = await authApi.signup(formData.email, formData.password, formData.name || undefined)

    if (data.success) {
      if (data.requiresVerification) {
        // Show verification sent message
        setVerificationSent(true)
        setUserEmail(data.email || formData.email)
        toast.success('Account created!', {
          description: 'Please check your email to verify your account.',
        })
      } else if (data.token && data.user) {
        // Direct login (shouldn't happen now, but keeping for safety)
        cookies.setAuth(data.token, data.user)
        toast.success('Welcome to SalaPeso!')
        router.push('/dashboard')
        router.refresh()
      }
    } else {
      toast.error(data.error === 'User already exists' 
        ? 'Account already exists' 
        : 'Signup failed', {
        description: data.error === 'User already exists'
          ? 'An account with this email already exists. Please log in instead.'
          : 'Something went wrong. Please try again.',
      })
    }
  }

  const handleResendVerification = async () => {
    setResendLoading(true)
    
    try {
      const result = await authApi.resendVerification(userEmail)
      if (result.success) {
        toast.success('Verification email sent!', {
          description: 'Please check your inbox.',
        })
      } else {
        toast.error('Failed to resend', {
          description: result.error || 'Please try again.',
        })
      }
    } catch {
      toast.error('Something went wrong', {
        description: 'Please try again later.',
      })
    } finally {
      setResendLoading(false)
    }
  }

  // Show verification sent screen
  if (verificationSent) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
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
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold">Check your email</h1>
            <FieldDescription>
              We&apos;ve sent a verification link to<br />
              <span className="font-medium text-foreground">{userEmail}</span>
            </FieldDescription>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Click the link in your email to verify your account. 
              The link will expire in 24 hours.
            </p>
          </div>

          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Didn&apos;t receive the email?
            </p>
            <Button 
              variant="outline" 
              onClick={handleResendVerification}
              disabled={resendLoading}
              className="w-full"
            >
              {resendLoading ? 'Sending...' : 'Resend verification email'}
            </Button>
          </div>

          <Field>
            <Link href="/login">
              <Button variant="ghost" className="w-full gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Log In
              </Button>
            </Link>
          </Field>
        </FieldGroup>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
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
            <h1 className="text-xl font-bold">Create an account</h1>
            <FieldDescription>
              Already have an account? <Link href="/login" className="underline underline-offset-4">Log in</Link>
            </FieldDescription>
          </div>

          {/* Google Sign-Up Button */}
          {isGoogleConfigured && (
            <>
              <Field>
                <GoogleLoginButton 
                  onError={(error) => toast.error('Google signup failed', { description: error })} 
                  onLoadingChange={setGoogleLoading}
                  disabled={isSubmitting}
                  text="Continue with Google"
                />
              </Field>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>
            </>
          )}

          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              {...register('name')}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </Field>

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

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="off"
                {...register('password')}
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
            <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="off"
                {...register('confirmPassword')}
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

          <Field>
            <Button type="submit" className="w-full" disabled={isSubmitting || googleLoading}>
              {isSubmitting ? 'Creating account...' : 'Sign Up'}
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link>{" "}
        and <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
      </FieldDescription>
    </div>
  )
}
