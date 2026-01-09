'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

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
import { ArrowLeft, CheckCircle, Eye, EyeOff, ShieldAlert } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string | null
  provider?: string
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword !== data.currentPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

export function ChangePasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    const currentUser = cookies.getUser<User>()
    setUser(currentUser)
  }, [])

  const canChangePassword = user?.provider === 'credentials'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (formData: ChangePasswordFormData) => {
    setError('')

    const token = cookies.getToken()
    if (!token) {
      setError('You must be logged in to change your password')
      return
    }

    try {
      const result = await authApi.changePassword(formData.currentPassword, formData.newPassword, token)

      if (result.success) {
        setSuccess(true)
      } else {
        if (result.error === 'Current password is incorrect') {
          setError('The current password you entered is incorrect.')
        } else {
          setError(result.error || 'Something went wrong. Please try again.')
        }
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
  }

  // Show blocked message for users without a password (Google-only users)
  if (user && !canChangePassword) {
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
              <ShieldAlert className="h-6 w-6 text-amber-600" />
            </div>
            <h1 className="text-xl font-bold">Password change unavailable</h1>
            <FieldDescription>
              You signed in with Google, so your password is managed by Google. 
              To change your Google account password, visit your Google Account settings.
            </FieldDescription>
          </div>

          <Field>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Back to Dashboard
            </Button>
          </Field>
        </FieldGroup>
      </div>
    )
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
              <h1 className="text-xl font-bold">Change your password</h1>
              <FieldDescription>
                Enter your current password and choose a new one.
              </FieldDescription>
            </div>

            <Field>
              <FieldLabel htmlFor="currentPassword">Current Password</FieldLabel>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="off"
                  {...register('currentPassword')}
                  aria-invalid={!!errors.currentPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-sm text-destructive mt-1">{errors.currentPassword.message}</p>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="off"
                  {...register('newPassword')}
                  aria-invalid={!!errors.newPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-destructive mt-1">{errors.newPassword.message}</p>
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

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Field>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Changing...' : 'Change Password'}
              </Button>
            </Field>

            <div className="text-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
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
            <h1 className="text-xl font-bold">Password changed!</h1>
            <FieldDescription>
              Your password has been successfully changed.
            </FieldDescription>
          </div>

          <Field>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          </Field>
        </FieldGroup>
      )}
    </div>
  )
}

