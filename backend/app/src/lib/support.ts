import { Elysia, t } from 'elysia'
import { jwt } from '@elysiajs/jwt'
import prisma from './prisma'

export const supportRoutes = new Elysia({ prefix: '/support' })
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
    })
  )
  // Get support count (public) and check if user has hearted (if authenticated)
  .get('/', async ({ headers, jwt }) => {
    try {
      // Get total count
      const count = await prisma.supportHeart.count()

      // Check if user is authenticated and has hearted
      let hasHearted = false
      const authHeader = headers.authorization
      
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1]
        const payload = await jwt.verify(token) as { userId?: string } | false
        
        if (payload && payload.userId) {
          const existing = await prisma.supportHeart.findUnique({
            where: { userId: payload.userId }
          })
          hasHearted = !!existing
        }
      }

      return {
        success: true,
        count,
        hasHearted
      }
    } catch (error: any) {
      return { success: false, error: error.message, count: 0, hasHearted: false }
    }
  })

  // Toggle heart (authenticated users only)
  .post('/', async ({ headers, jwt, set }) => {
    try {
      // Verify authentication
      const authHeader = headers.authorization
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        set.status = 401
        return { success: false, error: 'Authentication required' }
      }

      const token = authHeader.split(' ')[1]
      const payload = await jwt.verify(token) as { userId?: string } | false

      if (!payload || !payload.userId) {
        set.status = 401
        return { success: false, error: 'Invalid token' }
      }

      const userId = payload.userId

      // Check if already hearted
      const existing = await prisma.supportHeart.findUnique({
        where: { userId }
      })

      if (existing) {
        // Remove heart (toggle off)
        await prisma.supportHeart.delete({
          where: { userId }
        })
      } else {
        // Add heart
        await prisma.supportHeart.create({
          data: { userId }
        })
      }

      // Get new count
      const count = await prisma.supportHeart.count()

      return {
        success: true,
        count,
        hasHearted: !existing // toggled state
      }
    } catch (error: any) {
      set.status = 500
      return { success: false, error: error.message }
    }
  })
