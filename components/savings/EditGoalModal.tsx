'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Pencil } from 'lucide-react'
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

const goalPresets = [
  'Emergency Fund',
  'Investment',
  'Vacation',
  'New Gadget',
  'Education',
  'House',
  'Car',
  'Wedding',
  'Retirement',
  'Other',
]

interface EditGoalModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name?: string; targetAmount?: number; currentAmount?: number }) => Promise<void>
  goal: SavingsGoal | null
  isLoading?: boolean
}

export function EditGoalModal({ isOpen, onClose, onSubmit, goal, isLoading: externalLoading }: EditGoalModalProps) {
  const [goalName, setGoalName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('')

  const isLoading = externalLoading || false

  // Populate fields when goal changes
  useEffect(() => {
    if (goal) {
      setGoalName(goal.name || '')
      setTargetAmount(goal.targetAmount ? String(goal.targetAmount) : '')
      setCurrentAmount(String(goal.currentAmount))
    }
  }, [goal])

  const handleSubmit = async () => {
    try {
      await onSubmit({
        name: goalName || undefined,
        targetAmount: targetAmount ? parseFloat(targetAmount) : undefined,
        currentAmount: currentAmount ? parseFloat(currentAmount) : undefined,
      })
      handleClose()
    } catch (error) {
      console.error('Failed to update goal:', error)
    }
  }

  const handleClose = () => {
    onClose()
  }

  if (!goal) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center"
            >
              <Pencil className="size-5" />
            </motion.div>
            <DialogTitle>Edit Goal</DialogTitle>
          </div>
        </DialogHeader>

        {/* Wallet preview */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center py-2 border-b"
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
          {/* Goal name */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <label className="text-sm font-medium mb-2 block">Goal Name</label>
            <Input
              type="text"
              placeholder="e.g., Emergency Fund"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              className="mb-2"
            />
            <div className="flex flex-wrap gap-2">
              {goalPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setGoalName(preset)}
                  className={cn(
                    'px-3 py-1 text-xs rounded-full border transition-colors',
                    goalName === preset 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'hover:bg-muted'
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Current balance */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="text-sm font-medium mb-2 block">Current Balance</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₱</span>
              <Input
                type="number"
                placeholder="0.00"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="pl-8"
                min="0"
                step="0.01"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Adjusting the balance will create an adjustment entry
            </p>
          </motion.div>

          {/* Target amount */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <label className="text-sm font-medium mb-2 block">Target Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₱</span>
              <Input
                type="number"
                placeholder="0.00 (Optional)"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="pl-8"
                min="0"
                step="0.01"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty to remove the target
            </p>
          </motion.div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !currentAmount}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
