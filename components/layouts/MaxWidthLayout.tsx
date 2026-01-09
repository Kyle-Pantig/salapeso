import { cn } from "@/lib/utils"

interface MaxWidthLayoutProps {
  children: React.ReactNode
  className?: string
  as?: React.ElementType
}

export function MaxWidthLayout({
  children,
  className,
  as: Component = "div",
}: MaxWidthLayoutProps) {
  return (
    <Component
      className={cn(
        "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
        className
      )}
    >
      {children}
    </Component>
  )
}

