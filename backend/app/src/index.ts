import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { jwt } from '@elysiajs/jwt'
import prisma from './lib/prisma'
import { authRoutes } from './lib/auth'
import { savingsRoutes } from './lib/savings'

const PORT = parseInt(process.env.PORT || '3001')

// Helper to verify JWT and get user
async function verifyAuth(headers: Record<string, string | undefined>, jwtVerify: (token: string) => Promise<any>) {
    const authHeader = headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { user: null, error: 'No token provided' }
    }

    const token = authHeader.split(' ')[1]
    const payload = await jwtVerify(token)

    if (!payload) {
        return { user: null, error: 'Invalid token' }
    }

    const user = await prisma.user.findUnique({
        where: { id: payload.userId as string },
        select: {
            id: true,
            email: true,
            name: true,
            image: true,
            // NEVER select password!
        }
    })

    if (!user) {
        return { user: null, error: 'User not found' }
    }

    return { user, error: null }
}

// Protected user routes
const userRoutes = new Elysia({ prefix: '/users' })
    .use(
        jwt({
            name: 'jwt',
            secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
        })
    )
    .get('/', async ({ headers, jwt: jwtInstance, set }) => {
        const { user, error } = await verifyAuth(headers, jwtInstance.verify)
        if (error || !user) {
            set.status = 401
            return { success: false, error: error || 'Unauthorized' }
        }
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    createdAt: true,
                    // NEVER include password!
                }
            })
            return { success: true, data: users }
        } catch (err: any) {
            return { success: false, error: err.message }
        }
    })
    .get('/:id', async ({ params: { id }, headers, jwt: jwtInstance, set }) => {
        const { user, error } = await verifyAuth(headers, jwtInstance.verify)
        if (error || !user) {
            set.status = 401
            return { success: false, error: error || 'Unauthorized' }
        }
        try {
            const foundUser = await prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    createdAt: true,
                    // NEVER include password!
                }
            })
            if (!foundUser) {
                set.status = 404
                return { success: false, error: 'User not found' }
            }
            return { success: true, data: foundUser }
        } catch (err: any) {
            return { success: false, error: err.message }
        }
    })

const app = new Elysia()
    .use(cors({
        origin: [
            'http://localhost:3000',
            process.env.FRONTEND_URL || 'https://salapeso.vercel.app'
        ].filter(Boolean) as string[],
        credentials: true
    }))
    // Public routes
    .get('/health', () => ({ 
        success: true, 
        message: 'API is running',
        timestamp: new Date().toISOString()
    }))
    // Auth routes (login, signup, etc.)
    .use(authRoutes)
    // Protected routes
    .use(savingsRoutes)
    .use(userRoutes)
    .listen(PORT)

console.log(`🦊 Elysia is running at http://localhost:${PORT}`)
console.log(`📊 Prisma: Ready`)
console.log(`🔐 JWT Auth: Enabled`)
