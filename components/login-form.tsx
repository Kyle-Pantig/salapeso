'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { cn } from "@/lib/utils"
import { authApi } from "@/lib/api"
import { cookies } from "@/lib/cookies"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useGoogleOAuthConfig } from "@/components/providers/GoogleOAuthProvider"
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton"
import { loginSchema, LoginFormData } from "@/validations/users"
import { Eye, EyeOff, Mail } from 'lucide-react'

const REMEMBER_EMAIL_KEY = 'salapeso_remember_email'

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [requiresVerification, setRequiresVerification] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const isGoogleConfigured = useGoogleOAuthConfig()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY)
    if (rememberedEmail) {
      setValue('email', rememberedEmail)
      setRememberMe(true)
    }
  }, [setValue])

  const onSubmit = async (formData: LoginFormData) => {
    setError('')
    setRequiresVerification(false)

    // Save or clear remembered email
    if (rememberMe) {
      localStorage.setItem(REMEMBER_EMAIL_KEY, formData.email)
    } else {
      localStorage.removeItem(REMEMBER_EMAIL_KEY)
    }

    const data = await authApi.login(formData.email, formData.password)

    if (data.success && data.token && data.user) {
      cookies.setAuth(data.token, data.user)
      router.push('/dashboard')
      router.refresh()
    } else if (data.requiresVerification) {
      setRequiresVerification(true)
      setUnverifiedEmail(data.email || formData.email)
    } else {
      setError(data.error || 'Login failed')
    }
  }

  const handleResendVerification = async () => {
    setResendLoading(true)
    setResendMessage('')
    
    try {
      const result = await authApi.resendVerification(unverifiedEmail)
      if (result.success) {
        setResendMessage('Verification email sent!')
      } else {
        setResendMessage(result.error || 'Failed to resend')
      }
    } catch {
      setResendMessage('Something went wrong')
    } finally {
      setResendLoading(false)
    }
  }

  // Show verification required screen
  if (requiresVerification) {
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
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 mb-2">
              <Mail className="h-6 w-6 text-amber-600" />
            </div>
            <h1 className="text-xl font-bold">Email not verified</h1>
            <FieldDescription>
              Please verify your email address before logging in.<br />
              <span className="font-medium text-foreground">{unverifiedEmail}</span>
            </FieldDescription>
          </div>

          <div className="text-center space-y-3">
            <Button 
              variant="outline" 
              onClick={handleResendVerification}
              disabled={resendLoading}
              className="w-full"
            >
              {resendLoading ? 'Sending...' : 'Resend verification email'}
            </Button>
            {resendMessage && (
              <p className={cn(
                "text-sm",
                resendMessage.includes('sent') ? 'text-green-600' : 'text-destructive'
              )}>
                {resendMessage}
              </p>
            )}
          </div>

          <Field>
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => {
                setRequiresVerification(false)
                setResendMessage('')
              }}
            >
              Try a different account
            </Button>
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
            <h1 className="text-xl font-bold">Welcome back</h1>
            <FieldDescription>
              Don&apos;t have an account? <Link href="/signup" className="underline underline-offset-4">Sign up</Link>
            </FieldDescription>
          </div>

          {/* Google Log-In Button */}
          {isGoogleConfigured && (
            <>
              <Field>
                <GoogleLoginButton 
                  onError={setError} 
                  onLoadingChange={setGoogleLoading}
                  disabled={isSubmitting}
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

          <div className="flex items-center justify-between -mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <label
                htmlFor="remember"
                className="text-sm text-muted-foreground cursor-pointer select-none"
              >
                Remember me
              </label>
            </div>
            <Link 
              href="/forgot-password" 
              className="text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <div className="space-y-3 -mt-1">
            {error && (
              <p className="text-sm text-destructive text-center">
                {error === 'Invalid credentials' 
                  ? 'The email or password you entered is incorrect. Please try again.'
                  : 'Something went wrong. Please try again later.'
                }
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting || googleLoading}>
              {isSubmitting ? 'Logging in...' : 'Log In'}
            </Button>
          </div>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link>{" "}
        and <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
      </FieldDescription>
    </div>
  )
}
