'use client'

import { useEffect, useRef, useState } from 'react'
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
  const [displayValue, setDisplayValue] = useState(value)
  const previousValue = useRef(value)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    // If not in view yet or value is 0, just set directly
    if (!isInView) {
      setDisplayValue(value)
      previousValue.current = value
      return
    }

    const startValue = previousValue.current
    const endValue = value
    const startTime = Date.now()

    // If values are the same, no need to animate
    if (startValue === endValue) return

    // Quick animation for subsequent updates (300ms), longer for initial (duration)
    const animDuration = previousValue.current === 0 ? duration : 300

    const step = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(elapsed / animDuration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const current = startValue + (endValue - startValue) * easeOutQuart
      
      setDisplayValue(Math.round(current))

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(step)
      } else {
        previousValue.current = endValue
      }
    }

    animationRef.current = requestAnimationFrame(step)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isInView, value, duration])

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
