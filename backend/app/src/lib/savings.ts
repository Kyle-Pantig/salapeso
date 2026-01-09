import { Elysia, t } from 'elysia'
import { jwt } from '@elysiajs/jwt'
import prisma from './prisma'

// Helper to get user from token
async function getUserFromToken(authorization: string | undefined, jwtVerify: any) {
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null
  }
  const token = authorization.split(' ')[1]
  const payload = await jwtVerify(token)
  if (!payload || !payload.userId) return null
  return payload.userId as string
}

export const savingsRoutes = new Elysia({ prefix: '/savings' })
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
    })
  )
  // Get all wallets (public)
  .get('/wallets', async () => {
    try {
      const wallets = await prisma.wallet.findMany({
        where: { isActive: true },
        orderBy: { slug: 'asc' },
      })
      return { success: true, data: wallets }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
  // Get user's savings goals
  .get('/goals', async ({ headers, jwt: jwtInstance, set }) => {
    try {
      const userId = await getUserFromToken(headers.authorization, jwtInstance.verify)
      if (!userId) {
        set.status = 401
        return { success: false, error: 'Unauthorized' }
      }

      const goals = await prisma.savingsGoal.findMany({
        where: { userId },
        include: {
          wallet: true,
          entries: {
            orderBy: { createdAt: 'desc' },
            take: 5, // last 5 entries
          },
        },
        orderBy: { createdAt: 'asc' }, // oldest first, new goals appear at end
      })

      return { success: true, data: goals }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
  // Create savings goal
  .post('/goals', async ({ body, headers, jwt: jwtInstance, set }) => {
    try {
      const userId = await getUserFromToken(headers.authorization, jwtInstance.verify)
      if (!userId) {
        set.status = 401
        return { success: false, error: 'Unauthorized' }
      }

      const { walletId, name, targetAmount, initialAmount } = body as any

      // Create goal
      const goal = await prisma.savingsGoal.create({
        data: {
          userId,
          walletId,
          name: name || 'Savings',
          targetAmount: targetAmount || null,
          currentAmount: initialAmount || 0,
        },
        include: { wallet: true },
      })

      // If initial amount, create entry
      if (initialAmount && initialAmount > 0) {
        await prisma.savingsEntry.create({
          data: {
            savingsGoalId: goal.id,
            amount: initialAmount,
            note: 'Initial balance',
          },
        })
      }

      return { success: true, data: goal }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }, {
    body: t.Object({
      walletId: t.String(),
      name: t.Optional(t.String()),
      targetAmount: t.Optional(t.Number()),
      initialAmount: t.Optional(t.Number()),
    })
  })
  // Add savings entry (deposit/withdraw)
  .post('/goals/:goalId/entries', async ({ params, body, headers, jwt: jwtInstance, set }) => {
    try {
      const userId = await getUserFromToken(headers.authorization, jwtInstance.verify)
      if (!userId) {
        set.status = 401
        return { success: false, error: 'Unauthorized' }
      }

      const { goalId } = params
      const { amount, note } = body as any

      // Verify goal belongs to user
      const goal = await prisma.savingsGoal.findFirst({
        where: { id: goalId, userId },
      })

      if (!goal) {
        set.status = 404
        return { success: false, error: 'Savings goal not found' }
      }

      // Create entry
      const entry = await prisma.savingsEntry.create({
        data: {
          savingsGoalId: goalId,
          amount,
          note,
        },
      })

      // Update current amount
      const newAmount = Number(goal.currentAmount) + Number(amount)
      await prisma.savingsGoal.update({
        where: { id: goalId },
        data: {
          currentAmount: newAmount,
          isCompleted: goal.targetAmount ? newAmount >= Number(goal.targetAmount) : false,
        },
      })

      return { success: true, data: entry }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }, {
    body: t.Object({
      amount: t.Number(),
      note: t.Optional(t.String()),
    })
  })
  // Get goal details with all entries
  .get('/goals/:goalId', async ({ params, headers, jwt: jwtInstance, set }) => {
    try {
      const userId = await getUserFromToken(headers.authorization, jwtInstance.verify)
      if (!userId) {
        set.status = 401
        return { success: false, error: 'Unauthorized' }
      }

      const goal = await prisma.savingsGoal.findFirst({
        where: { id: params.goalId, userId },
        include: {
          wallet: true,
          entries: {
            orderBy: { createdAt: 'desc' },
          },
        },
      })

      if (!goal) {
        set.status = 404
        return { success: false, error: 'Savings goal not found' }
      }

      return { success: true, data: goal }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
  // Update savings goal
  .patch('/goals/:goalId', async ({ params, body, headers, jwt: jwtInstance, set }) => {
    try {
      const userId = await getUserFromToken(headers.authorization, jwtInstance.verify)
      if (!userId) {
        set.status = 401
        return { success: false, error: 'Unauthorized' }
      }

      const goal = await prisma.savingsGoal.findFirst({
        where: { id: params.goalId, userId },
      })

      if (!goal) {
        set.status = 404
        return { success: false, error: 'Savings goal not found' }
      }

      const { name, targetAmount, currentAmount } = body as any

      // Calculate if adjustment entry is needed
      const oldAmount = Number(goal.currentAmount)
      const newAmount = currentAmount !== undefined ? Number(currentAmount) : oldAmount
      const difference = newAmount - oldAmount

      // Update goal
      const updatedGoal = await prisma.savingsGoal.update({
        where: { id: params.goalId },
        data: {
          name: name !== undefined ? name : goal.name,
          targetAmount: targetAmount !== undefined ? (targetAmount || null) : goal.targetAmount,
          currentAmount: newAmount,
          isCompleted: targetAmount !== undefined 
            ? (targetAmount ? newAmount >= targetAmount : false)
            : (goal.targetAmount ? newAmount >= Number(goal.targetAmount) : false),
        },
        include: { wallet: true },
      })

      // Create adjustment entry if balance changed
      if (difference !== 0) {
        await prisma.savingsEntry.create({
          data: {
            savingsGoalId: params.goalId,
            amount: difference,
            note: 'Balance adjustment',
          },
        })
      }

      return { success: true, data: updatedGoal }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }, {
    body: t.Object({
      name: t.Optional(t.String()),
      targetAmount: t.Optional(t.Number()),
      currentAmount: t.Optional(t.Number()),
    })
  })
  // Delete savings goal
  .delete('/goals/:goalId', async ({ params, headers, jwt: jwtInstance, set }) => {
    try {
      const userId = await getUserFromToken(headers.authorization, jwtInstance.verify)
      if (!userId) {
        set.status = 401
        return { success: false, error: 'Unauthorized' }
      }

      const goal = await prisma.savingsGoal.findFirst({
        where: { id: params.goalId, userId },
      })

      if (!goal) {
        set.status = 404
        return { success: false, error: 'Savings goal not found' }
      }

      await prisma.savingsGoal.delete({
        where: { id: params.goalId },
      })

      return { success: true, message: 'Goal deleted' }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
  // Get all transactions across all goals (optimized single query)
  .get('/transactions', async ({ headers, jwt: jwtInstance, set, query }) => {
    try {
      const userId = await getUserFromToken(headers.authorization, jwtInstance.verify)
      if (!userId) {
        set.status = 401
        return { success: false, error: 'Unauthorized' }
      }

      const limit = query.limit ? parseInt(query.limit as string) : 20

      // Single optimized query using nested where
      const entries = await prisma.savingsEntry.findMany({
        where: {
          savingsGoal: { userId },
        },
        include: {
          savingsGoal: {
            include: { wallet: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      })

      return { success: true, data: entries }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
  // Get summary stats
  .get('/summary', async ({ headers, jwt: jwtInstance, set }) => {
    try {
      const userId = await getUserFromToken(headers.authorization, jwtInstance.verify)
      if (!userId) {
        set.status = 401
        return { success: false, error: 'Unauthorized' }
      }

      const goals = await prisma.savingsGoal.findMany({
        where: { userId },
      })

      const totalSaved = goals.reduce((sum, g) => sum + Number(g.currentAmount), 0)
      const totalTarget = goals.reduce((sum, g) => sum + (Number(g.targetAmount) || 0), 0)
      const activeGoals = goals.filter(g => !g.isCompleted).length
      const completedGoals = goals.filter(g => g.isCompleted).length

      return {
        success: true,
        data: {
          totalSaved,
          totalTarget,
          activeGoals,
          completedGoals,
          goalsCount: goals.length,
        },
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

