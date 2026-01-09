'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { supportApi } from '@/lib/api'
import { cookies } from '@/lib/cookies'
import { cn } from '@/lib/utils'

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

export function SupportHeartButton() {
  const router = useRouter()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [count, setCount] = useState(0)
  const [hasHearted, setHasHearted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)

  const triggerConfetti = () => {
    if (!buttonRef.current) return
    
    const rect = buttonRef.current.getBoundingClientRect()
    const x = (rect.left + rect.width / 2) / window.innerWidth
    const y = (rect.top + rect.height / 2) / window.innerHeight

    const count = 200
    const defaults = { origin: { x, y } }

    const fire = (particleRatio: number, opts: confetti.Options) => {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      })
    }

    fire(0.25, { spread: 26, startVelocity: 55 })
    fire(0.2, { spread: 60 })
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
    fire(0.1, { spread: 120, startVelocity: 45 })
  }

  // Fetch initial count and heart status
  useEffect(() => {
    const fetchSupport = async () => {
      setIsFetching(true)
      try {
        const token = cookies.getToken()
        const result = await supportApi.getSupport(token || undefined) as SupportResponse
        if (result.success) {
          setCount(result.count ?? 0)
          setHasHearted(result.hasHearted ?? false)
        }
      } finally {
        setIsFetching(false)
      }
    }
    fetchSupport()
  }, [])

  const handleClick = async () => {
    const token = cookies.getToken()
    
    // If not authenticated, redirect to login
    if (!token) {
      toast.info('Login required', {
        description: 'Please log in to show your support!',
      })
      router.push('/login')
      return
    }

    // Store previous state for rollback
    const prevHasHearted = hasHearted
    const prevCount = count

    // Optimistic update - trigger immediately
    const willHeart = !hasHearted
    setHasHearted(willHeart)
    setCount(willHeart ? count + 1 : count - 1)
    setIsAnimating(true)

    if (willHeart) {
      triggerConfetti()
      toast.success('Thank you for your support! ❤️')
    }

    setIsLoading(true)

    try {
      const result = await supportApi.toggleHeart(token) as SupportResponse
      
      if (result.success) {
        // Sync with server response
        setCount(result.count ?? (willHeart ? prevCount + 1 : prevCount - 1))
        setHasHearted(result.hasHearted ?? willHeart)
      } else {
        // Rollback on error
        setHasHearted(prevHasHearted)
        setCount(prevCount)
        toast.error('Something went wrong')
      }
    } catch {
      // Rollback on error
      setHasHearted(prevHasHearted)
      setCount(prevCount)
      toast.error('Failed to update')
    } finally {
      setIsLoading(false)
      setTimeout(() => setIsAnimating(false), 300)
    }
  }

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      disabled={isLoading}
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
