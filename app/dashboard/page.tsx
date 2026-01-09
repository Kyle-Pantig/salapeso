'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cookies } from "@/lib/cookies"
import { Header, MaxWidthLayout } from "@/components/layouts"
import { SavingsCard, AddGoalModal, AddEntryModal, EditGoalModal, TransactionHistory, RecentTransactions } from "@/components/savings"
import { PiggyBank, Target, Plus, TrendingUp, Shield, Briefcase, Plane, Smartphone, GraduationCap, Home, Car, Heart, Clock, Wallet as WalletIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { SavingsGoal } from "@/types/savings"
import { AnimatedCurrency, AnimatedNumber } from "@/components/ui/animated-number"
import { ScrollToTop } from "@/components/ui/scroll-to-top"
import Image from "next/image"
import { 
  useWallets, 
  useGoals, 
  useSummary, 
  useTransactions, 
  useGoal,
  useCreateGoal, 
  useUpdateGoal, 
  useDeleteGoal, 
  useAddEntry 
} from "@/hooks"

interface User {
  id: string
  email: string
  name: string | null
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const userData = cookies.getUser<User>()
    setUser(userData)
    if (!userData) {
      router.push('/login')
    }
  }, [router])

  // React Query hooks
  const { data: wallets = [], isLoading: walletsLoading } = useWallets()
  const { data: goals = [], isLoading: goalsLoading } = useGoals()
  const { data: summary } = useSummary()
  const { data: transactions = [], isLoading: transactionsLoading } = useTransactions(100)

  // Mutations
  const createGoalMutation = useCreateGoal()
  const updateGoalMutation = useUpdateGoal()
  const deleteGoalMutation = useDeleteGoal()
  const addEntryMutation = useAddEntry()

  // Modal states
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [showAddEntry, setShowAddEntry] = useState(false)
  const [showEditGoal, setShowEditGoal] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null)
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [entryMode, setEntryMode] = useState<'deposit' | 'withdraw'>('deposit')

  // Fetch goal details for history
  const { data: goalDetails } = useGoal(selectedGoalId || '')

  const isLoading = walletsLoading || goalsLoading

  // Wait for client-side check
  if (!isClient) {
    return null
  }

  // Redirect if not authenticated
  if (!user) {
    return null
  }

  const handleCreateGoal = async (data: { walletId: string; name?: string; targetAmount?: number; initialAmount?: number }) => {
    await createGoalMutation.mutateAsync(data)
    setShowAddGoal(false)
  }

  const handleAddEntry = async (data: { amount: number; note?: string }) => {
    if (!selectedGoal) return
    await addEntryMutation.mutateAsync({ goalId: selectedGoal.id, data })
    setShowAddEntry(false)
    setSelectedGoal(null)
  }

  const handleDeleteGoal = async (goal: SavingsGoal) => {
    await deleteGoalMutation.mutateAsync(goal.id)
  }

  const handleEditGoal = async (data: { name?: string; targetAmount?: number; currentAmount?: number }) => {
    if (!selectedGoal) return
    await updateGoalMutation.mutateAsync({ goalId: selectedGoal.id, data })
    setShowEditGoal(false)
    setSelectedGoal(null)
  }

  const openDeposit = (goal: SavingsGoal) => {
    setSelectedGoal(goal)
    setEntryMode('deposit')
    setShowAddEntry(true)
  }

  const openWithdraw = (goal: SavingsGoal) => {
    setSelectedGoal(goal)
    setEntryMode('withdraw')
    setShowAddEntry(true)
  }

  const openHistory = (goal: SavingsGoal) => {
    setSelectedGoal(goal) // Show immediately with existing data
    setSelectedGoalId(goal.id) // Fetch full details in background
    setShowHistory(true)
  }

  const openEdit = (goal: SavingsGoal) => {
    setSelectedGoal(goal)
    setShowEditGoal(true)
  }

  // Get icon and color for goal type
  const getGoalTypeConfig = (name: string) => {
    const configs: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
      'Emergency Fund': { icon: Shield, color: 'text-red-600', bg: 'bg-red-500/10' },
      'Investment': { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-500/10' },
      'Vacation': { icon: Plane, color: 'text-blue-600', bg: 'bg-blue-500/10' },
      'New Gadget': { icon: Smartphone, color: 'text-purple-600', bg: 'bg-purple-500/10' },
      'Education': { icon: GraduationCap, color: 'text-yellow-600', bg: 'bg-yellow-500/10' },
      'House': { icon: Home, color: 'text-orange-600', bg: 'bg-orange-500/10' },
      'Car': { icon: Car, color: 'text-slate-600', bg: 'bg-slate-500/10' },
      'Wedding': { icon: Heart, color: 'text-pink-600', bg: 'bg-pink-500/10' },
      'Retirement': { icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
      'Savings': { icon: PiggyBank, color: 'text-primary', bg: 'bg-primary/10' },
    }
    return configs[name] || { icon: WalletIcon, color: 'text-gray-600', bg: 'bg-gray-500/10' }
  }

  // Group goals by name and calculate totals
  const goalsByType = goals.reduce((acc, goal) => {
    const name = goal.name || 'Savings'
    if (!acc[name]) {
      acc[name] = { total: 0, count: 0, completed: 0 }
    }
    acc[name].total += Number(goal.currentAmount)
    acc[name].count += 1
    if (goal.isCompleted) acc[name].completed += 1
    return acc
  }, {} as Record<string, { total: number; count: number; completed: number }>)

  // No longer restricting - allow multiple goals per wallet
  const existingWalletIds: string[] = []

  return (
    <>
      <Header onAddGoal={() => setShowAddGoal(true)} />
      <MaxWidthLayout className="py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.name || user.email}!
            </p>
          </div>
          {/* Hide on mobile - shown in header instead */}
          <Button className="gap-2 hidden md:flex" onClick={() => setShowAddGoal(true)}>
            <Plus className="size-4" />
            New Goal
          </Button>
        </motion.div>
        
        {/* Stats - only show when there are goals */}
        {!isLoading && goals.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            {/* Total & Summary Row */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 mb-4">
              <div className="p-6 rounded-xl border bg-card col-span-2 md:col-span-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <PiggyBank className="size-5" />
                  </div>
                  <p className="text-sm text-muted-foreground">Total Saved</p>
                </div>
                <p className="text-3xl font-bold">
                  <AnimatedCurrency value={summary?.totalSaved || 0} />
                </p>
              </div>
              <div className="p-6 rounded-xl border bg-card">
                <div className="flex items-center gap-3 mb-2">
                  <div className="size-10 rounded-lg bg-green-500/10 text-green-600 flex items-center justify-center">
                    <TrendingUp className="size-5" />
                  </div>
                  <p className="text-sm text-muted-foreground">Active Goals</p>
                </div>
                <p className="text-3xl font-bold">
                  <AnimatedNumber value={summary?.activeGoals || 0} />
                </p>
              </div>
              <div className="p-6 rounded-xl border bg-card">
                <div className="flex items-center gap-3 mb-2">
                  <div className="size-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <Target className="size-5" />
                  </div>
                  <p className="text-sm text-muted-foreground">Goals Completed</p>
                </div>
                <p className="text-3xl font-bold">
                  <AnimatedNumber value={summary?.completedGoals || 0} />
                </p>
              </div>
            </div>

            {/* Dynamic Goal Type Cards */}
            <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
              {Object.entries(goalsByType).map(([name, data], index) => {
                const config = getGoalTypeConfig(name)
                const Icon = config.icon
                return (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 + index * 0.05 }}
                    className="p-4 rounded-xl border bg-card"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`size-8 rounded-lg ${config.bg} ${config.color} flex items-center justify-center`}>
                        <Icon className="size-4" />
                      </div>
                      <p className="text-xs font-medium text-muted-foreground truncate">{name}</p>
                    </div>
                    <p className="text-lg font-bold">
                      <AnimatedCurrency value={data.total} />
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {data.count} goal{data.count > 1 ? 's' : ''}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state - no goals */}
        {!isLoading && goals.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="relative w-64 h-64 mb-6">
              <Image
                src="/SalaPesoImages/waiting.png"
                alt="Waiting for savings"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">Start Your Savings Journey</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Track your savings across different wallets and banks. Add your first wallet to get started!
            </p>
            <Button size="lg" className="gap-2" onClick={() => setShowAddGoal(true)}>
              <Plus className="size-5" />
              Add Your First Wallet
            </Button>
          </motion.div>
        )}

        {/* Main content grid - only when there are goals */}
        {!isLoading && goals.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
            {/* Goals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-lg font-semibold mb-4">Your Savings Goals</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {goals.map((goal, index) => (
                  <SavingsCard
                    key={goal.id}
                    goal={goal}
                    index={index}
                    onDeposit={openDeposit}
                    onWithdraw={openWithdraw}
                    onDelete={handleDeleteGoal}
                    onEdit={openEdit}
                    onViewHistory={openHistory}
                  />
                ))}
                
                {/* Add new goal card */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: goals.length * 0.05 }}
                  onClick={() => setShowAddGoal(true)}
                  className="h-full min-h-[200px] rounded-2xl border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
                >
                  <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                    <Plus className="size-6" />
                  </div>
                  <span className="font-medium">Add Wallet</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:sticky lg:top-4 h-fit"
            >
              <RecentTransactions transactions={transactions} isLoading={transactionsLoading} />
            </motion.div>
          </div>
        )}
      </MaxWidthLayout>

      {/* Modals */}
      <AddGoalModal
        isOpen={showAddGoal}
        onClose={() => setShowAddGoal(false)}
        onSubmit={handleCreateGoal}
        wallets={wallets}
        existingWalletIds={existingWalletIds}
        isLoading={createGoalMutation.isPending}
      />

      <AddEntryModal
        isOpen={showAddEntry}
        onClose={() => {
          setShowAddEntry(false)
          setSelectedGoal(null)
        }}
        onSubmit={handleAddEntry}
        goal={selectedGoal}
        mode={entryMode}
        isLoading={addEntryMutation.isPending}
      />

      <EditGoalModal
        isOpen={showEditGoal}
        onClose={() => {
          setShowEditGoal(false)
          setSelectedGoal(null)
        }}
        onSubmit={handleEditGoal}
        goal={selectedGoal}
        isLoading={updateGoalMutation.isPending}
      />

      <TransactionHistory
        isOpen={showHistory}
        onClose={() => {
          setShowHistory(false)
          setSelectedGoalId(null)
          setSelectedGoal(null)
        }}
        goal={goalDetails || selectedGoal}
        isLoadingDetails={!!selectedGoalId && !goalDetails}
      />

      <ScrollToTop />
    </>
  )
}
