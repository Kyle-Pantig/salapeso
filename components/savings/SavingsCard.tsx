'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { SavingsGoal } from '@/types/savings'
import { motion } from 'framer-motion'
import { Plus, Minus, History, Trash2, Pencil, Loader2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

// Track wallet IDs that have been animated (persists across re-renders)
const animatedWallets = new Set<string>()

interface SavingsCardProps {
  goal: SavingsGoal
  onDeposit: (goal: SavingsGoal) => void
  onWithdraw: (goal: SavingsGoal) => void
  onDelete: (goal: SavingsGoal) => Promise<void>
  onEdit: (goal: SavingsGoal) => void
  onViewHistory: (goal: SavingsGoal) => void
  index?: number
}

export function SavingsCard({ goal, onDeposit, onWithdraw, onDelete, onEdit, onViewHistory, index = 0 }: SavingsCardProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Use walletId to track animations (stable across temp->real ID change)
  const shouldAnimate = !animatedWallets.has(goal.walletId)
  
  // Mark as animated after first render
  useEffect(() => {
    animatedWallets.add(goal.walletId)
  }, [goal.walletId])

  const progress = goal.targetAmount 
    ? Math.min((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100, 100)
    : null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(goal)
      setIsDeleteOpen(false)
    } catch (error) {
      console.error('Failed to delete:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: shouldAnimate ? index * 0.05 : 0 }}
      layout
    >
      <Card className={cn(
        'group relative transition-all hover:shadow-lg hover:border-primary/20 py-0',
        goal.isCompleted && 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
      )}>
        <CardContent className="p-4">
          {/* Completed badge */}
          {goal.isCompleted && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-2 left-2 px-2 py-1 rounded-full bg-green-500 text-white text-xs font-medium z-10"
            >
              ✓ Goal reached!
            </motion.div>
          )}

          {/* Logo & Actions */}
          <div className="flex items-start justify-between mb-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewHistory(goal)}
              className="relative w-32 h-20"
              title="View history"
            >
              <Image
                src={goal.wallet.logo}
                alt={goal.wallet.slug}
                fill
                className="object-contain object-left"
              />
            </motion.button>
            
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="size-8"
                onClick={() => onViewHistory(goal)}
                title="View history"
              >
                <History className="size-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="size-8"
                onClick={() => onEdit(goal)}
                title="Edit"
              >
                <Pencil className="size-4" />
              </Button>
              
              <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    title="Delete"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete savings goal?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this savings goal and all its transaction history. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="size-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        'Delete'
                      )}
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Goal name & Balance */}
          <motion.div 
            initial={shouldAnimate ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ delay: shouldAnimate ? 0.1 + index * 0.05 : 0 }}
            className="mb-4"
          >
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {goal.name || 'Savings'}
            </p>
            <p className="text-2xl font-bold tracking-tight">
              {formatCurrency(Number(goal.currentAmount))}
            </p>
            <p className="text-sm text-muted-foreground">
              {goal.targetAmount 
                ? `of ${formatCurrency(Number(goal.targetAmount))} target`
                : 'No target set'
              }
            </p>
          </motion.div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              {progress !== null && (
                <motion.div
                  initial={shouldAnimate ? { width: 0 } : false}
                  animate={{ width: `${progress}%` }}
                  transition={{ delay: shouldAnimate ? 0.3 + index * 0.05 : 0, duration: shouldAnimate ? 0.5 : 0.2 }}
                  className={cn(
                    'h-full rounded-full',
                    progress >= 100 ? 'bg-green-500' : 'bg-primary'
                  )}
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {progress !== null ? `${progress.toFixed(0)}% complete` : 'Set a target to track progress'}
            </p>
          </div>

          {/* Last Updated */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
            <Clock className="size-3" />
            <span>Updated {formatLastUpdated(goal.updatedAt)}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 gap-1"
              onClick={() => onDeposit(goal)}
            >
              <Plus className="size-3" />
              Deposit
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1"
              onClick={() => onWithdraw(goal)}
              disabled={Number(goal.currentAmount) <= 0}
            >
              <Minus className="size-3" />
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
