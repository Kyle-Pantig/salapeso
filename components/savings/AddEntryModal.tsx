'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { SavingsGoal } from '@/types/savings'
import { cn } from '@/lib/utils'

interface AddEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { amount: number; note?: string }) => Promise<void>
  goal: SavingsGoal | null
  mode: 'deposit' | 'withdraw'
  isLoading?: boolean
}

export function AddEntryModal({ isOpen, onClose, onSubmit, goal, mode, isLoading: externalLoading }: AddEntryModalProps) {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  const isLoading = externalLoading || false

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) return

    const finalAmount = mode === 'withdraw' ? -parseFloat(amount) : parseFloat(amount)
    
    // Close immediately (optimistic UI)
    handleClose()
    
    try {
      await onSubmit({
        amount: finalAmount,
        note: note || undefined,
      })
    } catch (error) {
      console.error('Failed to add entry:', error)
    }
  }

  const handleClose = () => {
    setAmount('')
    setNote('')
    onClose()
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const maxWithdraw = goal ? Number(goal.currentAmount) : 0
  const quickAmounts = [100, 500, 1000, 5000]

  if (!goal) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className={cn(
          'rounded-t-lg -mx-6 -mt-6 px-6 pt-6 pb-4',
          mode === 'deposit' ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30'
        )}>
          <div className="flex items-center gap-3">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className={cn(
                'size-10 rounded-full flex items-center justify-center',
                mode === 'deposit' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              )}
            >
              {mode === 'deposit' ? <Plus className="size-5" /> : <Minus className="size-5" />}
            </motion.div>
            <div>
              <DialogTitle>
                {mode === 'deposit' ? 'Add Deposit' : 'Withdraw'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Balance: {formatCurrency(Number(goal.currentAmount))}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Wallet preview */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="-mt-2 mb-2 border-b flex justify-center pb-2"
        >
          <div className="relative w-28 h-12">
            <img
              src={goal.wallet.logo}
              alt={goal.wallet.slug}
              className="w-full h-full object-contain"
            />
          </div>
        </motion.div>

        {/* Content */}
        <div className="space-y-4 py-2">
          {/* Amount input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="text-sm font-medium mb-2 block">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">₱</span>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 text-2xl h-14 font-bold"
                min="0"
                max={mode === 'withdraw' ? maxWithdraw : undefined}
                step="0.01"
                autoFocus
              />
            </div>
            {mode === 'withdraw' && (
              <p className="text-xs text-muted-foreground mt-1">
                Max: {formatCurrency(maxWithdraw)}
              </p>
            )}
          </motion.div>

          {/* Quick amounts */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-2"
          >
            {quickAmounts.map((qa, index) => (
              <motion.div
                key={qa}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="flex-1"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(qa.toString())}
                  disabled={mode === 'withdraw' && qa > maxWithdraw}
                  className="w-full"
                >
                  ₱{qa.toLocaleString()}
                </Button>
              </motion.div>
            ))}
          </motion.div>

          {/* Note input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="text-sm font-medium mb-2 block">Note (Optional)</label>
            <Input
              placeholder="What's this for?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </motion.div>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !amount || parseFloat(amount) <= 0 || (mode === 'withdraw' && parseFloat(amount) > maxWithdraw)}
            className={cn(
              'w-full',
              mode === 'deposit' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            )}
          >
            {isLoading ? 'Processing...' : mode === 'deposit' ? 'Add Deposit' : 'Withdraw'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
