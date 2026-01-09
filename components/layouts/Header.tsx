'use client'

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { LogOut, Plus, KeyRound, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cookies } from "@/lib/cookies"
import { MaxWidthLayout } from "./MaxWidthLayout"

interface User {
  id: string
  email: string
  name: string | null
  image?: string | null
  provider?: string
}

interface HeaderProps {
  onAddGoal?: () => void
}

export function Header({ onAddGoal }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)
  const isHomePage = pathname === '/'

  useEffect(() => {
    setUser(cookies.getUser<User>())
    setMounted(true)
  }, [])

  const handleLogout = () => {
    cookies.clearAuth()
    setUser(null)
    if (isHomePage) {
      // Force page refresh on homepage to update auth state
      window.location.reload()
    } else {
      router.push('/')
    }
  }

  const scrollToSection = (id: string) => {
    if (isHomePage) {
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      router.push(`/#${id}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <MaxWidthLayout>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/salapeso-logo.png"
              alt="SalaPeso"
              width={140}
              height={40}
              priority
            />
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-2 sm:gap-4">
            {/* Section links - hidden on dashboard */}
            {!onAddGoal && (
              <div className="hidden sm:flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => scrollToSection('features')}
                  className="rounded-full"
                >
                  Features
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => scrollToSection('how-it-works')}
                  className="rounded-full"
                >
                  How it works
                </Button>
              </div>
            )}

            {user ? (
              <>
                {/* Dashboard link - only when not on dashboard */}
                {!onAddGoal && (
                  <Link href="/dashboard">
                    <Button size="sm" className="rounded-full">
                      Dashboard
                    </Button>
                  </Link>
                )}
                {/* New Goal button - only on mobile when on dashboard */}
                {onAddGoal && (
                  <Button 
                    size="sm"
                    onClick={onAddGoal}
                    className="gap-2 rounded-full md:hidden"
                  >
                    <Plus className="size-4" />
                    New Goal
                  </Button>
                )}
                
                {/* User Avatar Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative size-9 rounded-full">
                      <Avatar className="size-9 border-2 border-border">
                        <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.name 
                            ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                            : user.email[0].toUpperCase()
                          }
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        {user.name && (
                          <p className="text-sm font-medium leading-none">{user.name}</p>
                        )}
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user.provider === 'credentials' && (
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/change-password">
                          <KeyRound className="mr-2 size-4" />
                          Change Password
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onSelect={(e) => {
                        e.preventDefault()
                        setTheme(theme === 'dark' ? 'light' : 'dark')
                      }} 
                      className="cursor-pointer"
                    >
                      {mounted && theme === 'dark' ? (
                        <>
                          <Sun className="mr-2 size-4" />
                          Light Theme
                        </>
                      ) : (
                        <>
                          <Moon className="mr-2 size-4" />
                          Dark Theme
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                      <LogOut className="mr-2 size-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="rounded-full">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="rounded-full">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </MaxWidthLayout>
    </header>
  )
}
