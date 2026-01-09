'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownLeft, History } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SavingsGoal } from '@/types/savings'
import { cn } from '@/lib/utils'

interface TransactionHistoryProps {
  isOpen: boolean
  onClose: () => void
  goal: SavingsGoal | null
}

export function TransactionHistory({ isOpen, onClose, goal }: TransactionHistoryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(Math.abs(amount))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const entries = goal?.entries || []

  if (!goal) return null

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        {/* Header */}
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center gap-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-24 h-14"
            >
              <img
                src={goal.wallet.logo}
                alt={goal.wallet.slug}
                className="w-full h-full object-contain object-left"
              />
            </motion.div>
            <div>
              <SheetTitle>Transaction History</SheetTitle>
            </div>
          </div>
        </SheetHeader>

        {/* Balance summary */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-muted/50 border-b"
        >
          <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
          <p className="text-2xl font-bold">{formatCurrency(Number(goal.currentAmount))}</p>
          {goal.targetAmount && (
            <p className="text-sm text-muted-foreground">
              Target: {formatCurrency(Number(goal.targetAmount))}
            </p>
          )}
        </motion.div>

        {/* Transactions list */}
        <div className="flex-1 overflow-y-auto">
          {entries.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full text-center p-8"
            >
              <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <History className="size-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">No transactions yet</h3>
              <p className="text-sm text-muted-foreground">
                Your deposit and withdrawal history will appear here
              </p>
            </motion.div>
          ) : (
            <div className="divide-y">
              {entries.map((entry, index) => {
                const isDeposit = Number(entry.amount) > 0
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className={cn(
                      'size-10 rounded-full flex items-center justify-center',
                      isDeposit 
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30' 
                        : 'bg-red-100 text-red-600 dark:bg-red-900/30'
                    )}>
                      {isDeposit ? (
                        <ArrowDownLeft className="size-5" />
                      ) : (
                        <ArrowUpRight className="size-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">
                        {isDeposit ? 'Deposit' : 'Withdrawal'}
                      </p>
                      {entry.note && (
                        <p className="text-sm text-muted-foreground truncate">
                          {entry.note}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDate(entry.createdAt)}
                      </p>
                    </div>
                    <p className={cn(
                      'font-semibold',
                      isDeposit ? 'text-green-600' : 'text-red-600'
                    )}>
                      {isDeposit ? '+' : '-'}{formatCurrency(Number(entry.amount))}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
