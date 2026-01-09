'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { savingsApi } from '@/lib/api'
import { cookies } from '@/lib/cookies'
import type { Wallet, SavingsGoal, SavingsSummary, TransactionWithWallet } from '@/types/savings'

// Query keys for consistent cache management
export const savingsKeys = {
  all: ['savings'] as const,
  wallets: () => [...savingsKeys.all, 'wallets'] as const,
  goals: () => [...savingsKeys.all, 'goals'] as const,
  goal: (id: string) => [...savingsKeys.goals(), id] as const,
  summary: () => [...savingsKeys.all, 'summary'] as const,
  transactions: () => [...savingsKeys.all, 'transactions'] as const,
  transactionsWithLimit: (limit?: number) => [...savingsKeys.transactions(), limit] as const,
}

// Get auth token helper
const getToken = () => cookies.getToken() || ''

// ============ QUERIES ============

// Fetch all wallets
export function useWallets() {
  return useQuery({
    queryKey: savingsKeys.wallets(),
    queryFn: async () => {
      const result = await savingsApi.getWallets()
      if (!result.success) throw new Error(result.error)
      return result.data as Wallet[]
    },
  })
}

// Fetch user's savings goals
export function useGoals() {
  return useQuery({
    queryKey: savingsKeys.goals(),
    queryFn: async () => {
      const token = getToken()
      if (!token) throw new Error('Not authenticated')
      const result = await savingsApi.getGoals(token)
      if (!result.success) throw new Error(result.error)
      return result.data as SavingsGoal[]
    },
  })
}

// Fetch a single goal with entries
export function useGoal(goalId: string) {
  return useQuery({
    queryKey: savingsKeys.goal(goalId),
    queryFn: async () => {
      const token = getToken()
      if (!token) throw new Error('Not authenticated')
      const result = await savingsApi.getGoal(goalId, token)
      if (!result.success) throw new Error(result.error)
      return result.data as SavingsGoal
    },
    enabled: !!goalId,
  })
}

// Fetch savings summary
export function useSummary() {
  return useQuery({
    queryKey: savingsKeys.summary(),
    queryFn: async () => {
      const token = getToken()
      if (!token) throw new Error('Not authenticated')
      const result = await savingsApi.getSummary(token)
      if (!result.success) throw new Error(result.error)
      return result.data as SavingsSummary
    },
  })
}

// Fetch all transactions
export function useTransactions(limit?: number) {
  return useQuery({
    queryKey: savingsKeys.transactionsWithLimit(limit),
    queryFn: async () => {
      const token = getToken()
      if (!token) throw new Error('Not authenticated')
      const result = await savingsApi.getTransactions(token, limit)
      if (!result.success) throw new Error(result.error)
      return result.data as TransactionWithWallet[]
    },
  })
}

// ============ MUTATIONS ============

// Create a new goal
export function useCreateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { 
      walletId: string
      name?: string
      targetAmount?: number
      initialAmount?: number 
    }) => {
      const token = getToken()
      if (!token) throw new Error('Not authenticated')
      const result = await savingsApi.createGoal(data, token)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      // Invalidate and refetch goals, summary, and transactions
      queryClient.invalidateQueries({ queryKey: savingsKeys.goals() })
      queryClient.invalidateQueries({ queryKey: savingsKeys.summary() })
      queryClient.invalidateQueries({ queryKey: savingsKeys.transactions() })
    },
  })
}

// Update a goal
export function useUpdateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      goalId, 
      data 
    }: { 
      goalId: string
      data: { name?: string; targetAmount?: number; currentAmount?: number } 
    }) => {
      const token = getToken()
      if (!token) throw new Error('Not authenticated')
      const result = await savingsApi.updateGoal(goalId, data, token)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: savingsKeys.goals() })
      queryClient.invalidateQueries({ queryKey: savingsKeys.goal(variables.goalId) })
      queryClient.invalidateQueries({ queryKey: savingsKeys.summary() })
      queryClient.invalidateQueries({ queryKey: savingsKeys.transactions() })
    },
  })
}

// Delete a goal
export function useDeleteGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (goalId: string) => {
      const token = getToken()
      if (!token) throw new Error('Not authenticated')
      const result = await savingsApi.deleteGoal(goalId, token)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: savingsKeys.goals() })
      queryClient.invalidateQueries({ queryKey: savingsKeys.summary() })
      queryClient.invalidateQueries({ queryKey: savingsKeys.transactions() })
    },
  })
}

// Add entry to a goal
export function useAddEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      goalId, 
      data 
    }: { 
      goalId: string
      data: { amount: number; note?: string } 
    }) => {
      const token = getToken()
      if (!token) throw new Error('Not authenticated')
      const result = await savingsApi.addEntry(goalId, data, token)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: savingsKeys.goals() })
      queryClient.invalidateQueries({ queryKey: savingsKeys.goal(variables.goalId) })
      queryClient.invalidateQueries({ queryKey: savingsKeys.summary() })
      queryClient.invalidateQueries({ queryKey: savingsKeys.transactions() })
    },
  })
}

