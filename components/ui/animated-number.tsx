'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useInView } from 'framer-motion'

interface AnimatedNumberProps {
  value: number
  format?: (value: number) => string
  duration?: number
  className?: string
}

export function AnimatedNumber({ 
  value, 
  format = (v) => v.toString(),
  duration = 1000,
  className 
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [displayValue, setDisplayValue] = useState(0)
  const hasAnimated = useRef(false)

  const animate = useCallback(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true

    const startTime = Date.now()
    const startValue = 0
    const endValue = value

    const step = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const current = startValue + (endValue - startValue) * easeOutQuart
      
      setDisplayValue(Math.round(current))

      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }

    requestAnimationFrame(step)
  }, [value, duration])

  useEffect(() => {
    if (isInView && value > 0) {
      animate()
    } else if (value === 0) {
      setDisplayValue(0)
    }
  }, [isInView, value, animate])

  return (
    <span ref={ref} className={className}>
      {format(displayValue)}
    </span>
  )
}

// Currency formatter helper
export function AnimatedCurrency({ 
  value, 
  currency = 'PHP',
  className 
}: { 
  value: number
  currency?: string
  className?: string 
}) {
  const format = (v: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(v)
  }

  return (
    <AnimatedNumber 
      value={value} 
      format={format} 
      className={className}
      duration={1500}
    />
  )
}
