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
    staleTime: 30 * 1000, // Show cached data for 30 seconds
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
      wallet?: Wallet
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
    onMutate: async (newGoal) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: savingsKeys.goals() })
      await queryClient.cancelQueries({ queryKey: savingsKeys.summary() })

      // Snapshot previous values
      const previousGoals = queryClient.getQueryData<SavingsGoal[]>(savingsKeys.goals())
      const previousSummary = queryClient.getQueryData<SavingsSummary>(savingsKeys.summary())

      // Optimistically add the new goal
      if (previousGoals && newGoal.wallet) {
        const tempId = `temp-${Date.now()}`
        const optimisticGoal: SavingsGoal = {
          id: tempId,
          walletId: newGoal.walletId,
          wallet: newGoal.wallet,
          name: newGoal.name || 'Savings',
          targetAmount: newGoal.targetAmount ?? null,
          currentAmount: newGoal.initialAmount || 0,
          isCompleted: false,
          userId: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          entries: newGoal.initialAmount ? [{
            id: `temp-entry-${Date.now()}`,
            savingsGoalId: tempId,
            amount: newGoal.initialAmount,
            note: 'Initial deposit',
            createdAt: new Date().toISOString(),
          }] : [],
        }
        queryClient.setQueryData<SavingsGoal[]>(savingsKeys.goals(), [...previousGoals, optimisticGoal])
      }

      // Optimistically update summary
      if (previousSummary) {
        queryClient.setQueryData<SavingsSummary>(savingsKeys.summary(), {
          ...previousSummary,
          totalSaved: previousSummary.totalSaved + (newGoal.initialAmount || 0),
          goalsCount: previousSummary.goalsCount + 1,
        })
      }

      return { previousGoals, previousSummary }
    },
    onError: (_, __, context) => {
      // Rollback on error
      if (context?.previousGoals) {
        queryClient.setQueryData(savingsKeys.goals(), context.previousGoals)
      }
      if (context?.previousSummary) {
        queryClient.setQueryData(savingsKeys.summary(), context.previousSummary)
      }
    },
    onSettled: () => {
      // Always refetch to sync with server
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
    onMutate: async ({ goalId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: savingsKeys.goals() })
      await queryClient.cancelQueries({ queryKey: savingsKeys.goal(goalId) })

      // Snapshot previous values
      const previousGoals = queryClient.getQueryData<SavingsGoal[]>(savingsKeys.goals())
      const previousGoal = queryClient.getQueryData<SavingsGoal>(savingsKeys.goal(goalId))

      // Optimistically update the goals list
      if (previousGoals) {
        const updatedGoals = previousGoals.map(goal => {
          if (goal.id === goalId) {
            return {
              ...goal,
              name: data.name ?? goal.name,
              targetAmount: data.targetAmount ?? goal.targetAmount,
              currentAmount: data.currentAmount ?? goal.currentAmount,
            }
          }
          return goal
        })
        queryClient.setQueryData<SavingsGoal[]>(savingsKeys.goals(), updatedGoals)
      }

      // Optimistically update the single goal
      if (previousGoal) {
        queryClient.setQueryData<SavingsGoal>(savingsKeys.goal(goalId), {
          ...previousGoal,
          name: data.name ?? previousGoal.name,
          targetAmount: data.targetAmount ?? previousGoal.targetAmount,
          currentAmount: data.currentAmount ?? previousGoal.currentAmount,
        })
      }

      return { previousGoals, previousGoal, goalId }
    },
    onError: (_, __, context) => {
      // Rollback on error
      if (context?.previousGoals) {
        queryClient.setQueryData(savingsKeys.goals(), context.previousGoals)
      }
      if (context?.previousGoal && context.goalId) {
        queryClient.setQueryData(savingsKeys.goal(context.goalId), context.previousGoal)
      }
    },
    onSettled: (_, __, variables) => {
      // Always refetch to sync with server
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
    onMutate: async (goalId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: savingsKeys.goals() })
      await queryClient.cancelQueries({ queryKey: savingsKeys.summary() })

      // Snapshot previous values
      const previousGoals = queryClient.getQueryData<SavingsGoal[]>(savingsKeys.goals())
      const previousSummary = queryClient.getQueryData<SavingsSummary>(savingsKeys.summary())

      // Get the goal being deleted for rollback and summary update
      const goalToDelete = previousGoals?.find(g => g.id === goalId)

      // Optimistically remove the goal
      if (previousGoals) {
        queryClient.setQueryData<SavingsGoal[]>(
          savingsKeys.goals(), 
          previousGoals.filter(goal => goal.id !== goalId)
        )
      }

      // Optimistically update summary
      if (previousSummary && goalToDelete) {
        queryClient.setQueryData<SavingsSummary>(savingsKeys.summary(), {
          ...previousSummary,
          totalSaved: previousSummary.totalSaved - Number(goalToDelete.currentAmount),
          goalsCount: previousSummary.goalsCount - 1,
        })
      }

      return { previousGoals, previousSummary }
    },
    onError: (_, __, context) => {
      // Rollback on error
      if (context?.previousGoals) {
        queryClient.setQueryData(savingsKeys.goals(), context.previousGoals)
      }
      if (context?.previousSummary) {
        queryClient.setQueryData(savingsKeys.summary(), context.previousSummary)
      }
    },
    onSettled: () => {
      // Always refetch to sync with server
      queryClient.invalidateQueries({ queryKey: savingsKeys.goals() })
      queryClient.invalidateQueries({ queryKey: savingsKeys.summary() })
      queryClient.invalidateQueries({ queryKey: savingsKeys.transactions() })
    },
  })
}

// Add entry to a goal (deposit or withdraw)
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
    onMutate: async ({ goalId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: savingsKeys.goals() })
      await queryClient.cancelQueries({ queryKey: savingsKeys.goal(goalId) })
      await queryClient.cancelQueries({ queryKey: savingsKeys.summary() })
      await queryClient.cancelQueries({ queryKey: savingsKeys.transactions() })

      // Snapshot previous values
      const previousGoals = queryClient.getQueryData<SavingsGoal[]>(savingsKeys.goals())
      const previousGoal = queryClient.getQueryData<SavingsGoal>(savingsKeys.goal(goalId))
      const previousSummary = queryClient.getQueryData<SavingsSummary>(savingsKeys.summary())
      const previousTransactions = queryClient.getQueryData<TransactionWithWallet[]>(savingsKeys.transactionsWithLimit(undefined))

      // Optimistically update the goals list
      if (previousGoals) {
        const updatedGoals = previousGoals.map(goal => {
          if (goal.id === goalId) {
            const newAmount = Number(goal.currentAmount) + data.amount
            return { ...goal, currentAmount: newAmount }
          }
          return goal
        })
        queryClient.setQueryData<SavingsGoal[]>(savingsKeys.goals(), updatedGoals)
      }

      // Optimistically update the single goal
      if (previousGoal) {
        const newAmount = Number(previousGoal.currentAmount) + data.amount
        const optimisticEntry = {
          id: `temp-${Date.now()}`,
          savingsGoalId: goalId,
          amount: data.amount,
          note: data.note || null,
          createdAt: new Date().toISOString(),
        }
        queryClient.setQueryData<SavingsGoal>(savingsKeys.goal(goalId), {
          ...previousGoal,
          currentAmount: newAmount,
          entries: [optimisticEntry, ...(previousGoal.entries || [])],
        })
      }

      // Optimistically update summary
      if (previousSummary) {
        queryClient.setQueryData<SavingsSummary>(savingsKeys.summary(), {
          ...previousSummary,
          totalSaved: previousSummary.totalSaved + data.amount,
        })
      }

      // Optimistically add to recent transactions
      if (previousTransactions && previousGoals) {
        const goal = previousGoals.find(g => g.id === goalId)
        if (goal) {
          const optimisticTransaction: TransactionWithWallet = {
            id: `temp-${Date.now()}`,
            savingsGoalId: goalId,
            amount: data.amount,
            note: data.note || null,
            createdAt: new Date().toISOString(),
            savingsGoal: {
              wallet: goal.wallet,
            },
          }
          queryClient.setQueryData<TransactionWithWallet[]>(
            savingsKeys.transactionsWithLimit(undefined),
            [optimisticTransaction, ...previousTransactions]
          )
        }
      }

      return { previousGoals, previousGoal, previousSummary, previousTransactions, goalId }
    },
    onError: (_, __, context) => {
      // Rollback on error
      if (context?.previousGoals) {
        queryClient.setQueryData(savingsKeys.goals(), context.previousGoals)
      }
      if (context?.previousGoal && context.goalId) {
        queryClient.setQueryData(savingsKeys.goal(context.goalId), context.previousGoal)
      }
      if (context?.previousSummary) {
        queryClient.setQueryData(savingsKeys.summary(), context.previousSummary)
      }
      if (context?.previousTransactions) {
        queryClient.setQueryData(savingsKeys.transactionsWithLimit(undefined), context.previousTransactions)
      }
    },
    onSettled: (_, __, variables) => {
      // Always refetch to sync with server
      queryClient.invalidateQueries({ queryKey: savingsKeys.goals() })
      queryClient.invalidateQueries({ queryKey: savingsKeys.goal(variables.goalId) })
      queryClient.invalidateQueries({ queryKey: savingsKeys.summary() })
      queryClient.invalidateQueries({ queryKey: savingsKeys.transactions() })
    },
  })
}

