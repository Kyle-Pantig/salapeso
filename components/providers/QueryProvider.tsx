'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, createContext, useContext, useCallback } from 'react'

// Context to expose cache clearing function
const QueryCacheContext = createContext<{ clearCache: () => void } | null>(null)

export function useQueryCache() {
  const context = useContext(QueryCacheContext)
  if (!context) {
    throw new Error('useQueryCache must be used within QueryProvider')
  }
  return context
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  // Function to clear all cached data (call on logout/login)
  const clearCache = useCallback(() => {
    queryClient.clear()
  }, [queryClient])

  return (
    <QueryCacheContext.Provider value={{ clearCache }}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </QueryCacheContext.Provider>
  )
}

