'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Wallet, WalletType } from '@/types/savings'
import { motion } from 'framer-motion'

interface WalletSelectorProps {
  wallets: Wallet[]
  selectedId?: string
  onSelect: (wallet: Wallet) => void
  disabledIds?: string[]
}

const typeLabels: Record<WalletType, string> = {
  EWALLET: 'E-Wallets',
  BANK: 'Banks',
  CASH: 'Cash',
  OTHER: 'Other',
}

const typeOrder: WalletType[] = ['EWALLET', 'BANK', 'CASH', 'OTHER']

export function WalletSelector({ wallets, selectedId, onSelect, disabledIds = [] }: WalletSelectorProps) {
  // Group wallets by type
  const groupedWallets = wallets.reduce((acc, wallet) => {
    if (!acc[wallet.type]) acc[wallet.type] = []
    acc[wallet.type].push(wallet)
    return acc
  }, {} as Record<WalletType, Wallet[]>)

  return (
    <div className="space-y-6">
      {typeOrder.map((type) => {
        const typeWallets = groupedWallets[type]
        if (!typeWallets || typeWallets.length === 0) return null

        return (
          <div key={type}>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              {typeLabels[type]}
            </h4>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {typeWallets.map((wallet, index) => {
                const isDisabled = disabledIds.includes(wallet.id)
                const isSelected = selectedId === wallet.id

                return (
                  <motion.button
                    key={wallet.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => !isDisabled && onSelect(wallet)}
                    disabled={isDisabled}
                    className={cn(
                      'relative aspect-square rounded-xl border-2 p-2 transition-all',
                      'hover:border-primary hover:shadow-lg hover:scale-105',
                      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                      isSelected && 'border-primary bg-primary/5 shadow-md',
                      !isSelected && 'border-border bg-card',
                      isDisabled && 'opacity-40 cursor-not-allowed hover:border-border hover:scale-100 hover:shadow-none'
                    )}
                    title={isDisabled ? 'Already added' : wallet.slug}
                  >
                    <Image
                      src={wallet.logo}
                      alt={wallet.slug}
                      fill
                      className="object-contain p-1"
                    />
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 size-5 rounded-full bg-primary flex items-center justify-center"
                      >
                        <svg className="size-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

