'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownLeft, History } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TransactionWithWallet } from '@/types/savings'
import { cn } from '@/lib/utils'

interface RecentTransactionsProps {
  transactions: TransactionWithWallet[]
  isLoading?: boolean
}

export function RecentTransactions({ transactions, isLoading }: RecentTransactionsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(Math.abs(amount))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div>
        <h3 className="text-base font-semibold mb-4">Recent Activity</h3>
        <Card className="py-0">
          <CardContent className="px-4 py-4">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div>
        <h3 className="text-base font-semibold mb-4">Recent Activity</h3>
        <Card className="py-0">
          <CardContent className="px-4 py-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <History className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No transactions yet
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-base font-semibold mb-4">Recent Activity</h3>
      <Card className="py-0">
        <CardContent className="px-0 py-0">
          <ScrollArea className="h-[500px]">
            <div className="space-y-1 px-4 py-4">
              {transactions.map((entry, index) => {
                const isDeposit = Number(entry.amount) > 0
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center gap-3 py-2 hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors"
                  >
                    {/* Wallet logo */}
                    <div className="relative size-10 flex-shrink-0">
                      <img
                        src={entry.savingsGoal.wallet.logo}
                        alt={entry.savingsGoal.wallet.slug}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'size-5 rounded-full flex items-center justify-center flex-shrink-0',
                          isDeposit 
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30' 
                            : 'bg-red-100 text-red-600 dark:bg-red-900/30'
                        )}>
                          {isDeposit ? (
                            <ArrowDownLeft className="size-3" />
                          ) : (
                            <ArrowUpRight className="size-3" />
                          )}
                        </div>
                        <span className="text-sm font-medium truncate">
                          {entry.note || (isDeposit ? 'Deposit' : 'Withdrawal')}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(entry.createdAt)}
                      </p>
                    </div>
                    
                    {/* Amount */}
                    <p className={cn(
                      'text-sm font-semibold flex-shrink-0',
                      isDeposit ? 'text-green-600' : 'text-red-600'
                    )}>
                      {isDeposit ? '+' : '-'}{formatCurrency(Number(entry.amount))}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
