'use client'

import { useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { supportApi } from '@/lib/api'
import { cookies } from '@/lib/cookies'
import { cn } from '@/lib/utils'

// Debounce delay to prevent spam
const DEBOUNCE_MS = 1000

interface SupportData {
  count: number
  hasHearted: boolean
}

interface SupportResponse {
  success: boolean
  count?: number
  hasHearted?: boolean
  error?: string
}

function formatCount(num: number): string {
  if (num >= 1_000_000) {
    const value = num / 1_000_000
    return value % 1 === 0 ? `${value}m` : `${value.toFixed(1)}m`
  }
  if (num >= 1_000) {
    const value = num / 1_000
    return value % 1 === 0 ? `${value}k` : `${value.toFixed(1)}k`
  }
  return num.toString()
}

// Query key for support data
const supportKeys = {
  all: ['support'] as const,
  data: () => [...supportKeys.all, 'data'] as const,
}

export function SupportHeartButton() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isDebouncing, setIsDebouncing] = useState(false)
  const lastClickTime = useRef(0)

  // Fetch support data with React Query
  const { data, isLoading: isFetching } = useQuery({
    queryKey: supportKeys.data(),
    queryFn: async (): Promise<SupportData> => {
      const token = cookies.getToken()
      const result = await supportApi.getSupport(token || undefined) as SupportResponse
      if (!result.success) throw new Error(result.error)
      return {
        count: result.count ?? 0,
        hasHearted: result.hasHearted ?? false,
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
  })

  const count = data?.count ?? 0
  const hasHearted = data?.hasHearted ?? false

  // Toggle heart mutation with optimistic update
  const toggleMutation = useMutation({
    mutationFn: async () => {
      const token = cookies.getToken()
      if (!token) throw new Error('Not authenticated')
      const result = await supportApi.toggleHeart(token) as SupportResponse
      if (!result.success) throw new Error(result.error)
      return result
    },
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: supportKeys.data() })

      // Snapshot previous value
      const previous = queryClient.getQueryData<SupportData>(supportKeys.data())

      // Optimistic update
      const willHeart = !hasHearted
      queryClient.setQueryData<SupportData>(supportKeys.data(), {
        count: willHeart ? count + 1 : count - 1,
        hasHearted: willHeart,
      })

      // Trigger confetti and toast immediately
      setIsAnimating(true)
      if (willHeart) {
        triggerConfetti()
        toast.success('Thank you for your support! ❤️')
      }

      return { previous, willHeart }
    },
    onError: (_, __, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(supportKeys.data(), context.previous)
      }
      toast.error('Something went wrong')
    },
    onSuccess: (result) => {
      // Sync with actual server data (only on success, not on every settle)
      if (result.count !== undefined) {
        queryClient.setQueryData<SupportData>(supportKeys.data(), {
          count: result.count,
          hasHearted: result.hasHearted ?? !hasHearted,
        })
      }
    },
    onSettled: () => {
      setTimeout(() => setIsAnimating(false), 300)
    },
  })

  const triggerConfetti = () => {
    if (!buttonRef.current) return
    
    const rect = buttonRef.current.getBoundingClientRect()
    const x = (rect.left + rect.width / 2) / window.innerWidth
    const y = (rect.top + rect.height / 2) / window.innerHeight

    const particleCount = 200
    const defaults = { origin: { x, y } }

    const fire = (particleRatio: number, opts: confetti.Options) => {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(particleCount * particleRatio)
      })
    }

    fire(0.25, { spread: 26, startVelocity: 55 })
    fire(0.2, { spread: 60 })
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
    fire(0.1, { spread: 120, startVelocity: 45 })
  }

  const handleClick = useCallback(() => {
    const token = cookies.getToken()
    
    // If not authenticated, redirect to login
    if (!token) {
      toast.info('Login required', {
        description: 'Please log in to show your support!',
      })
      router.push('/login')
      return
    }

    // Debounce: prevent spam clicking
    const now = Date.now()
    if (now - lastClickTime.current < DEBOUNCE_MS) {
      return // Ignore rapid clicks
    }
    lastClickTime.current = now
    
    // Prevent clicking while mutation is in progress
    if (toggleMutation.isPending || isDebouncing) {
      return
    }

    setIsDebouncing(true)
    toggleMutation.mutate(undefined, {
      onSettled: () => {
        // Allow next click after debounce period
        setTimeout(() => setIsDebouncing(false), DEBOUNCE_MS)
      }
    })
  }, [router, toggleMutation, isDebouncing])

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      disabled={toggleMutation.isPending || isDebouncing}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all cursor-pointer",
        "border hover:scale-105 active:scale-95",
        hasHearted 
          ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400" 
          : "bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={hasHearted ? 'filled' : 'empty'}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: isAnimating ? 1.3 : 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
        >
          <Heart 
            className={cn(
              "size-3.5",
              hasHearted && "fill-red-500 text-red-500"
            )} 
          />
        </motion.div>
      </AnimatePresence>
      {isFetching ? (
        <Loader2 className="size-3 animate-spin" />
      ) : (
        <span className="font-medium tabular-nums">{formatCount(count)}</span>
      )}
    </motion.button>
  )
}
