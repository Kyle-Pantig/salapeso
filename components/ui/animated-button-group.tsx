'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnimatedButtonGroupProps {
  primaryText: string
  primaryHref: string
  secondaryText: string
  secondaryHref: string
  className?: string
}

export function AnimatedButtonGroup({
  primaryText,
  primaryHref,
  secondaryText,
  secondaryHref,
  className,
}: AnimatedButtonGroupProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [buttonRects, setButtonRects] = useState<{ left: number; width: number }[]>([])

  const buttons = [
    { text: primaryText, href: primaryHref, hasArrow: true },
    { text: secondaryText, href: secondaryHref, hasArrow: false },
  ]

  useEffect(() => {
    if (containerRef.current) {
      const buttonElements = containerRef.current.querySelectorAll('a')
      const rects = Array.from(buttonElements).map((el) => ({
        left: el.offsetLeft,
        width: el.offsetWidth,
      }))
      setButtonRects(rects)
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className={cn("inline-flex items-center p-1.5 rounded-full bg-muted relative", className)}
    >
      {/* Animated background */}
      {buttonRects.length > 0 && (
        <motion.div
          className="absolute top-1.5 bottom-1.5 rounded-full bg-primary"
          initial={false}
          animate={{
            left: buttonRects[activeIndex]?.left || 0,
            width: buttonRects[activeIndex]?.width || 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 35,
          }}
        />
      )}

      {buttons.map((button, index) => {
        const isAnchorLink = button.href.startsWith('#')
        
        const handleClick = (e: React.MouseEvent) => {
          if (isAnchorLink) {
            e.preventDefault()
            const targetId = button.href.slice(1)
            const element = document.getElementById(targetId)
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' })
            }
          }
        }

        return isAnchorLink ? (
          <a
            key={index}
            href={button.href}
            onClick={handleClick}
            onMouseEnter={() => setActiveIndex(index)}
            className={cn(
              "relative z-10 inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-colors duration-200 cursor-pointer",
              activeIndex === index ? "text-primary-foreground" : "text-foreground"
            )}
          >
            {button.text}
            {button.hasArrow && <ArrowRight className="size-4" />}
          </a>
        ) : (
          <Link
            key={index}
            href={button.href}
            onMouseEnter={() => setActiveIndex(index)}
            className={cn(
              "relative z-10 inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-colors duration-200",
              activeIndex === index ? "text-primary-foreground" : "text-foreground"
            )}
          >
            {button.text}
            {button.hasArrow && <ArrowRight className="size-4" />}
          </Link>
        )
      })}
    </div>
  )
}
