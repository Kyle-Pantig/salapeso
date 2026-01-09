export type WalletType = 'EWALLET' | 'BANK' | 'CASH' | 'OTHER'

export interface Wallet {
  id: string
  slug: string
  logo: string
  type: WalletType
  isActive: boolean
  createdAt: string
}

export interface SavingsEntry {
  id: string
  savingsGoalId: string
  amount: number
  note: string | null
  createdAt: string
}

export interface TransactionWithWallet extends SavingsEntry {
  savingsGoal: {
    wallet: Wallet
  }
}

export interface SavingsGoal {
  id: string
  userId: string
  walletId: string
  name: string
  currentAmount: number
  targetAmount: number | null
  isCompleted: boolean
  createdAt: string
  updatedAt: string
  wallet: Wallet
  entries?: SavingsEntry[]
}

export interface SavingsSummary {
  totalSaved: number
  totalTarget: number
  activeGoals: number
  completedGoals: number
  goalsCount: number
}

