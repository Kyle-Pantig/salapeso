'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
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
  const [count, setCount] = useState(0)
  const [hasHearted, setHasHearted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Fetch initial count and heart status
  useEffect(() => {
    const fetchSupport = async () => {
      const token = cookies.getToken()
      const result = await supportApi.getSupport(token || undefined) as SupportResponse
      if (result.success) {
        setCount(result.count ?? 0)
        setHasHearted(result.hasHearted ?? false)
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

    setIsLoading(true)
    setIsAnimating(true)

    try {
      const result = await supportApi.toggleHeart(token) as SupportResponse
      
      if (result.success) {
        setCount(result.count ?? 0)
        setHasHearted(result.hasHearted ?? false)
        
        if (result.hasHearted) {
          toast.success('Thank you for your support! ❤️')
        }
      } else {
        toast.error('Something went wrong')
      }
    } catch {
      toast.error('Failed to update')
    } finally {
      setIsLoading(false)
      setTimeout(() => setIsAnimating(false), 300)
    }
  }

  return (
    <motion.button
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
      <span className="font-medium tabular-nums">{formatCount(count)}</span>
    </motion.button>
  )
}
