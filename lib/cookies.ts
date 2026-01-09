// Cookie utility for client-side cookie management

interface CookieOptions {
  maxAge?: number // seconds
  path?: string
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
}

const DEFAULT_OPTIONS: CookieOptions = {
  maxAge: 7 * 24 * 60 * 60, // 7 days
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
}

export const cookies = {
  set(name: string, value: string, options: CookieOptions = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options }
    let cookie = `${name}=${encodeURIComponent(value)}; path=${opts.path}`
    
    if (opts.maxAge) cookie += `; max-age=${opts.maxAge}`
    if (opts.secure) cookie += '; secure'
    if (opts.sameSite) cookie += `; samesite=${opts.sameSite}`
    
    document.cookie = cookie
  },

  get(name: string): string | null {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift()
      return cookieValue ? decodeURIComponent(cookieValue) : null
    }
    return null
  },

  remove(name: string) {
    document.cookie = `${name}=; path=/; max-age=0`
  },

  // Auth-specific helpers
  setAuth(token: string, user: object) {
    this.set('token', token)
    this.set('user', JSON.stringify(user))
  },

  getUser<T = any>(): T | null {
    const user = this.get('user')
    if (!user) return null
    try {
      return JSON.parse(user)
    } catch {
      return null
    }
  },

  getToken(): string | null {
    return this.get('token')
  },

  clearAuth() {
    this.remove('token')
    this.remove('user')
  },
}

