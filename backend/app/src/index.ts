import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { authRoutes } from './lib/auth'
import { savingsRoutes } from './lib/savings'
import { supportRoutes } from './lib/support'

const PORT = parseInt(process.env.PORT || '3001')

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
    // Users can get their own data via /auth/me (protected)
    .use(authRoutes)
    // Savings routes - all protected, users can only access their own data
    .use(savingsRoutes)
    // Support heart routes - public read, authenticated write
    .use(supportRoutes)
    .listen(PORT)

console.log(`🦊 Elysia is running at http://localhost:${PORT}`)
console.log(`🔐 All routes protected - users can only access their own data`)
