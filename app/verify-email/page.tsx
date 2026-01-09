'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { authApi } from '@/lib/api'
import { cookies } from '@/lib/cookies'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link. No token provided.')
      toast.error('Invalid link', {
        description: 'No verification token provided.',
      })
      return
    }

    const verifyEmail = async () => {
      try {
        const result = await authApi.verifyEmail(token)
        
        if (result.success) {
          setStatus('success')
          setMessage(result.message || 'Your email has been verified successfully!')
          
          // Auto-login if token and user data are returned
          if (result.token && result.user) {
            cookies.setAuth(result.token, result.user)
            toast.success('Email verified!', {
              description: 'Redirecting to dashboard...',
            })
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              router.push('/dashboard')
              router.refresh()
            }, 1500)
          } else {
            toast.success('Email verified!', {
              description: 'You can now log in to your account.',
            })
          }
        } else {
          setStatus('error')
          setMessage(result.error || 'Failed to verify email')
          toast.error('Verification failed', {
            description: result.error || 'Please try again or request a new link.',
          })
        }
      } catch {
        setStatus('error')
        setMessage('Something went wrong. Please try again.')
        toast.error('Something went wrong', {
          description: 'Please try again later.',
        })
      }
    }

    verifyEmail()
  }, [token, router])

  return (
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

        {status === 'loading' && (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
            <h1 className="text-xl font-bold">Verifying your email...</h1>
            <FieldDescription>
              Please wait while we verify your email address.
            </FieldDescription>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="text-xl font-bold">Email Verified!</h1>
            <FieldDescription>
              {message}
            </FieldDescription>
            <FieldDescription className="flex items-center gap-2 text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirecting to dashboard...
            </FieldDescription>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-2">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <h1 className="text-xl font-bold">Verification Failed</h1>
            <FieldDescription>
              {message}
            </FieldDescription>
          </>
        )}
      </div>

      {status === 'error' && (
        <Field>
          <Link href="/login">
            <Button className="w-full">
              Back to Log In
            </Button>
          </Link>
        </Field>
      )}
    </FieldGroup>
  )
}

function LoadingFallback() {
  return (
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
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
        <h1 className="text-xl font-bold">Loading...</h1>
      </div>
    </FieldGroup>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={<LoadingFallback />}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  )
}
