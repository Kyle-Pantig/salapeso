'use client'

import { createContext, useContext } from 'react'
import { GoogleOAuthProvider as GoogleProvider } from '@react-oauth/google'

// Context to check if Google OAuth is configured
const GoogleOAuthConfigContext = createContext<boolean>(false)

export function useGoogleOAuthConfig() {
  return useContext(GoogleOAuthConfigContext)
}

export function GoogleOAuthProvider({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  if (!clientId) {
    console.warn('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set - Google Sign-In disabled')
    return (
      <GoogleOAuthConfigContext.Provider value={false}>
        {children}
      </GoogleOAuthConfigContext.Provider>
    )
  }

  return (
    <GoogleOAuthConfigContext.Provider value={true}>
      <GoogleProvider clientId={clientId}>
        {children}
      </GoogleProvider>
    </GoogleOAuthConfigContext.Provider>
  )
}

