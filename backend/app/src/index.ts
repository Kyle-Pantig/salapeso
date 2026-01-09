import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import prisma from './lib/prisma'
import { supabase, supabaseAdmin } from './lib/supabase'
import { authRoutes } from './lib/auth'
import { savingsRoutes } from './lib/savings'

const PORT = parseInt(process.env.PORT || '3001')

const app = new Elysia()
    .use(cors({
        origin: ['http://localhost:3000'],
        credentials: true
    }))
    .use(authRoutes)
    .use(savingsRoutes)
    // Prisma routes
    .get('/users', async () => {
        try {
            const users = await prisma.user.findMany()
            return { success: true, data: users }
        } catch (error: any) {
            return { success: false, error: error.message }
        }
    })
    .get('/users/:id', async ({ params: { id } }) => {
        try {
            const user = await prisma.user.findUnique({
                where: { id }
            })
            if (!user) {
                return { success: false, error: 'User not found' }
            }
            return { success: true, data: user }
        } catch (error: any) {
            return { success: false, error: error.message }
        }
    })
    .post('/users', async ({ body }: any) => {
        try {
            const { email, name } = body
            const user = await prisma.user.create({
                data: { email, name }
            })
            return { success: true, data: user }
        } catch (error: any) {
            return { success: false, error: error.message }
        }
    })
    
    // Supabase routes
    .get('/supabase/test', async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .limit(5)
            
            if (error) throw error
            return { success: true, data, source: 'supabase' }
        } catch (error: any) {
            return { success: false, error: error.message, source: 'supabase' }
        }
    })
    .get('/supabase/health', async () => {
        try {
            const { data, error } = await supabaseAdmin.auth.getSession()
            return { 
                success: true, 
                message: 'Supabase connection successful',
                connected: !error
            }
        } catch (error: any) {
            return { 
                success: false, 
                error: error.message,
                connected: false
            }
        }
    })
    
    // Combined test route
    .get('/test', async () => {
        try {
            // Test Prisma
            const prismaUsers = await prisma.user.findMany()
            
            // Test Supabase
            const { data: supabaseData, error: supabaseError } = await supabase
                .from('users')
                .select('*')
                .limit(5)
            
            return {
                success: true,
                prisma: {
                    connected: true,
                    usersCount: prismaUsers.length
                },
                supabase: {
                    connected: !supabaseError,
                    usersCount: supabaseData?.length || 0,
                    error: supabaseError?.message
                }
            }
        } catch (error: any) {
            return {
                success: false,
                error: error.message
            }
        }
    })
    .listen(PORT)

console.log(`🦊 Elysia is running at http://localhost:${PORT}`)
console.log(`📊 Prisma: Ready`)
console.log(`🔐 Supabase: ${process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configured' : 'Not configured'}`)
