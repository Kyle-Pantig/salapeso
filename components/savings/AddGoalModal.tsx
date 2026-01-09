'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { WalletSelector } from './WalletSelector'
import { Wallet } from '@/types/savings'
import { cn } from '@/lib/utils'

interface AddGoalModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { walletId: string; name?: string; targetAmount?: number; initialAmount?: number }) => Promise<void>
  wallets: Wallet[]
  existingWalletIds: string[]
  isLoading?: boolean
}

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

export function AddGoalModal({ isOpen, onClose, onSubmit, wallets, existingWalletIds, isLoading: externalLoading }: AddGoalModalProps) {
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null)
  const [goalName, setGoalName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [initialAmount, setInitialAmount] = useState('')
  const [step, setStep] = useState<'select' | 'details'>('select')

  const isLoading = externalLoading || false

  const handleSubmit = async () => {
    if (!selectedWallet) return

    try {
      await onSubmit({
        walletId: selectedWallet.id,
        name: goalName || 'Savings',
        targetAmount: targetAmount ? parseFloat(targetAmount) : undefined,
        initialAmount: initialAmount ? parseFloat(initialAmount) : undefined,
      })
      handleClose()
    } catch (error) {
      console.error('Failed to create goal:', error)
    }
  }

  const handleClose = () => {
    setSelectedWallet(null)
    setGoalName('')
    setTargetAmount('')
    setInitialAmount('')
    setStep('select')
    onClose()
  }

  const handleWalletSelect = (wallet: Wallet) => {
    setSelectedWallet(wallet)
  }

  const handleContinue = () => {
    if (selectedWallet) {
      setStep('details')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-2xl! max-h-[90vh]! flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {step === 'select' ? 'Select Wallet' : 'Goal Details'}
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 px-2">
          {step === 'select' ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <WalletSelector
                wallets={wallets}
                selectedId={selectedWallet?.id}
                onSelect={handleWalletSelect}
                disabledIds={existingWalletIds}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Selected wallet preview */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-4 p-3 rounded-xl bg-muted"
              >
                <div className="relative w-28 h-16">
                  <img
                    src={selectedWallet?.logo}
                    alt={selectedWallet?.slug}
                    className="w-full h-full object-contain object-left"
                  />
                </div>
              </motion.div>

              {/* Goal name */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <label className="text-sm font-medium mb-2 block">
                  What are you saving for?
                </label>
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

              {/* Initial amount */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="text-sm font-medium mb-2 block">
                  Current Balance (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₱</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                    className="pl-8"
                    min="0"
                    step="0.01"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your current balance in this wallet
                </p>
              </motion.div>

              {/* Target amount */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <label className="text-sm font-medium mb-2 block">
                  Target Amount (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₱</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="pl-8"
                    min="0"
                    step="0.01"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Set a savings goal to track your progress
                </p>
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="flex gap-2 sm:gap-2">
          {step === 'details' && (
            <Button variant="outline" onClick={() => setStep('select')} className="flex-1">
              Back
            </Button>
          )}
          {step === 'select' ? (
            <Button 
              onClick={handleContinue} 
              disabled={!selectedWallet}
              className="flex-1"
            >
              Continue
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Creating...' : 'Create Goal'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
