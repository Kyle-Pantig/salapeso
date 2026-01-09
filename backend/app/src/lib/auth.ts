import { Elysia, t } from 'elysia'
import { jwt } from '@elysiajs/jwt'
import { randomBytes } from 'crypto'
import prisma from './prisma'
import { sendEmail, generateResetCode, getPasswordResetEmailHtml, generateVerificationToken, getEmailVerificationHtml } from './email'

// Frontend URL for email links (set FRONTEND_URL in Railway)
const APP_URL = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Generate a secure URL-safe token
function generateResetToken(): string {
  return randomBytes(32).toString('base64url')
}

// Simple password hashing using Bun's built-in
async function hashPassword(password: string): Promise<string> {
  return await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 10,
  })
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await Bun.password.verify(password, hash)
}

export const authRoutes = new Elysia({ prefix: '/auth' })
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
      exp: '7d'
    })
  )
  // Signup
  .post('/signup', async ({ body, set }) => {
    try {
      const { email, password, name } = body

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        set.status = 400
        return { success: false, error: 'User already exists' }
      }

      // Hash password
      const hashedPassword = await hashPassword(password)

      // Create user with emailVerified = false
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          emailVerified: false,
          provider: 'credentials',
        }
      })

      // Generate verification token
      const verificationToken = generateVerificationToken()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      // Store verification token
      await prisma.emailVerificationToken.create({
        data: {
          email,
          token: verificationToken,
          expiresAt,
        }
      })

      // Send verification email
      const verificationUrl = `${APP_URL}/verify-email?token=${verificationToken}`
      await sendEmail({
        to: email,
        subject: 'Verify your SalaPeso account',
        html: getEmailVerificationHtml(verificationUrl, name),
      })

      return {
        success: true,
        message: 'Account created. Please check your email to verify your account.',
        requiresVerification: true,
        email: user.email,
      }
    } catch (error: any) {
      set.status = 500
      return { success: false, error: error.message }
    }
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String({ minLength: 6 }),
      name: t.Optional(t.String())
    })
  })
  // Login
  .post('/login', async ({ body, jwt, set }) => {
    try {
      const { email, password } = body

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user || !user.password) {
        set.status = 401
        return { success: false, error: 'Invalid credentials' }
      }

      // Verify password FIRST (before revealing verification status)
      const isValid = await verifyPassword(password, user.password)

      if (!isValid) {
        set.status = 401
        return { success: false, error: 'Invalid credentials' }
      }

      // Check if email is verified (only after password is confirmed correct)
      if (!user.emailVerified) {
        set.status = 403
        return { 
          success: false, 
          error: 'Email not verified',
          requiresVerification: true,
          email: user.email 
        }
      }

      // Generate token
      const token = await jwt.sign({ 
        userId: user.id, 
        email: user.email 
      })

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          provider: 'credentials',
        },
        token
      }
    } catch (error: any) {
      set.status = 500
      return { success: false, error: error.message }
    }
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String()
    })
  })
  // Google Sign-In - verify Google access token and create/get user
  .post('/google', async ({ body, jwt, set }) => {
    try {
      const { credential } = body

      // Get user info from Google using the access token
      const googleResponse = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: { Authorization: `Bearer ${credential}` }
        }
      )

      if (!googleResponse.ok) {
        set.status = 401
        return { success: false, error: 'Invalid Google token' }
      }

      const googleData = await googleResponse.json()
      const { email, name, picture, sub: googleId } = googleData

      if (!email) {
        set.status = 401
        return { success: false, error: 'No email from Google' }
      }

      // Find or create user
      let user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        // Create new user for Google sign-in - auto-verified
        user = await prisma.user.create({
          data: {
            email,
            name,
            image: picture,
            provider: 'google',
            providerAccountId: googleId,
            emailVerified: true,
          }
        })
      } else {
        // Update user info if needed
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            image: user.image || picture,
            provider: user.provider || 'google',
            providerAccountId: user.providerAccountId || googleId,
            name: user.name || name,
          }
        })
      }

      // Generate our JWT token
      const token = await jwt.sign({ 
        userId: user.id, 
        email: user.email 
      })

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          provider: 'google',
        },
        token
      }
    } catch (error: any) {
      console.error('Google auth error:', error)
      set.status = 500
      return { success: false, error: error.message }
    }
  }, {
    body: t.Object({
      credential: t.String()
    })
  })
  // Verify email
  .get('/verify-email', async ({ query, set }) => {
    try {
      const { token } = query

      if (!token) {
        set.status = 400
        return { success: false, error: 'Token is required' }
      }

      // Find the verification token
      const verificationToken = await prisma.emailVerificationToken.findUnique({
        where: { token }
      })

      if (!verificationToken) {
        set.status = 400
        return { success: false, error: 'Invalid verification link' }
      }

      if (verificationToken.used) {
        set.status = 400
        return { success: false, error: 'This link has already been used' }
      }

      if (verificationToken.expiresAt < new Date()) {
        set.status = 400
        return { success: false, error: 'Verification link has expired' }
      }

      // Update user as verified
      await prisma.user.update({
        where: { email: verificationToken.email },
        data: { emailVerified: true }
      })

      // Mark token as used
      await prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { used: true }
      })

      return { 
        success: true, 
        message: 'Email verified successfully. You can now log in.' 
      }
    } catch (error: any) {
      set.status = 500
      return { success: false, error: error.message }
    }
  }, {
    query: t.Object({
      token: t.String()
    })
  })
  // Resend verification email
  .post('/resend-verification', async ({ body, set }) => {
    try {
      const { email } = body

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        // Don't reveal if user exists
        return { success: true, message: 'If the email exists, a verification link has been sent.' }
      }

      if (user.emailVerified) {
        set.status = 400
        return { success: false, error: 'Email is already verified' }
      }

      // Delete old tokens
      await prisma.emailVerificationToken.deleteMany({
        where: { email }
      })

      // Generate new verification token
      const verificationToken = generateVerificationToken()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      // Store verification token
      await prisma.emailVerificationToken.create({
        data: {
          email,
          token: verificationToken,
          expiresAt,
        }
      })

      // Send verification email
      const verificationUrl = `${APP_URL}/verify-email?token=${verificationToken}`
      await sendEmail({
        to: email,
        subject: 'Verify your SalaPeso account',
        html: getEmailVerificationHtml(verificationUrl, user.name || undefined),
      })

      return { 
        success: true, 
        message: 'Verification email sent. Please check your inbox.' 
      }
    } catch (error: any) {
      set.status = 500
      return { success: false, error: error.message }
    }
  }, {
    body: t.Object({
      email: t.String({ format: 'email' })
    })
  })
  // Get current user (protected route)
  .get('/me', async ({ headers, jwt, set }) => {
    try {
      const authHeader = headers.authorization
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        set.status = 401
        return { success: false, error: 'No token provided' }
      }

      const token = authHeader.split(' ')[1]
      const payload = await jwt.verify(token)

      if (!payload) {
        set.status = 401
        return { success: false, error: 'Invalid token' }
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.userId as string },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          createdAt: true,
        }
      })

      if (!user) {
        set.status = 404
        return { success: false, error: 'User not found' }
      }

      return { success: true, user }
    } catch (error: any) {
      set.status = 500
      return { success: false, error: error.message }
    }
  })
  // Forgot Password - send reset code to email
  .post('/forgot-password', async ({ body, set }) => {
    try {
      const { email } = body

      // Find user (don't reveal if email exists or not for security)
      const user = await prisma.user.findUnique({
        where: { email }
      })

      // Always return success to prevent email enumeration
      // But we need to return a fake token for non-existent users
      if (!user) {
        return { 
          success: true, 
          message: 'If an account exists, a reset code has been sent.',
          token: generateResetToken() // Fake token to not reveal if email exists
        }
      }

      // Check if user signed up with Google (no password)
      if (user.provider === 'google' && !user.password) {
        return { 
          success: true, 
          message: 'If an account exists, a reset code has been sent.',
          token: generateResetToken() // Fake token
        }
      }

      // Delete any existing reset tokens for this email
      await prisma.passwordResetToken.deleteMany({
        where: { email }
      })

      // Generate new code and token
      const code = generateResetCode()
      const token = generateResetToken()
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

      // Save token
      await prisma.passwordResetToken.create({
        data: {
          email,
          token,
          code,
          expiresAt,
        }
      })

      // Send email
      const emailResult = await sendEmail({
        to: email,
        subject: 'Reset Your SalaPeso Password',
        html: getPasswordResetEmailHtml(code, user.name || undefined),
      })

      if (!emailResult.success) {
        console.error('Failed to send reset email:', emailResult.error)
        set.status = 500
        return { success: false, error: 'Failed to send reset email' }
      }

      return { 
        success: true, 
        message: 'If an account exists, a reset code has been sent.',
        token // Return the token for the reset URL
      }
    } catch (error: any) {
      console.error('Forgot password error:', error)
      set.status = 500
      return { success: false, error: error.message }
    }
  }, {
    body: t.Object({
      email: t.String({ format: 'email' })
    })
  })
  // Resend Reset Code - generates new code for existing token
  .post('/resend-reset-code', async ({ body, set }) => {
    try {
      const { token } = body

      // Find existing token
      const resetToken = await prisma.passwordResetToken.findFirst({
        where: {
          token,
          used: false,
        }
      })

      if (!resetToken) {
        set.status = 400
        return { success: false, error: 'Invalid or expired reset link' }
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: resetToken.email }
      })

      if (!user) {
        set.status = 400
        return { success: false, error: 'Invalid reset link' }
      }

      // Generate new code and update expiry
      const newCode = generateResetCode()
      const newExpiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

      // Update token with new code
      await prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: {
          code: newCode,
          expiresAt: newExpiresAt,
        }
      })

      // Send email
      const emailResult = await sendEmail({
        to: resetToken.email,
        subject: 'Reset Your SalaPeso Password',
        html: getPasswordResetEmailHtml(newCode, user.name || undefined),
      })

      if (!emailResult.success) {
        console.error('Failed to resend reset email:', emailResult.error)
        set.status = 500
        return { success: false, error: 'Failed to send reset email' }
      }

      return { success: true, message: 'A new code has been sent to your email.' }
    } catch (error: any) {
      console.error('Resend reset code error:', error)
      set.status = 500
      return { success: false, error: error.message }
    }
  }, {
    body: t.Object({
      token: t.String()
    })
  })
  // Verify Reset Code
  .post('/verify-reset-code', async ({ body, set }) => {
    try {
      const { token, code } = body

      // Find valid reset token
      const resetToken = await prisma.passwordResetToken.findFirst({
        where: {
          token,
          code,
          used: false,
          expiresAt: { gt: new Date() }
        }
      })

      if (!resetToken) {
        set.status = 400
        return { success: false, error: 'Invalid or expired code' }
      }

      return { success: true, message: 'Code verified successfully' }
    } catch (error: any) {
      set.status = 500
      return { success: false, error: error.message }
    }
  }, {
    body: t.Object({
      token: t.String(),
      code: t.String({ minLength: 6, maxLength: 6 })
    })
  })
  // Reset Password
  .post('/reset-password', async ({ body, set }) => {
    try {
      const { token, code, newPassword } = body

      // Find valid reset token
      const resetToken = await prisma.passwordResetToken.findFirst({
        where: {
          token,
          code,
          used: false,
          expiresAt: { gt: new Date() }
        }
      })

      if (!resetToken) {
        set.status = 400
        return { success: false, error: 'Invalid or expired code' }
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: resetToken.email }
      })

      if (!user) {
        set.status = 404
        return { success: false, error: 'User not found' }
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword)

      // Update password
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      })

      // Mark token as used
      await prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true }
      })

      // Delete all reset tokens for this email
      await prisma.passwordResetToken.deleteMany({
        where: { email: resetToken.email }
      })

      return { success: true, message: 'Password reset successfully' }
    } catch (error: any) {
      set.status = 500
      return { success: false, error: error.message }
    }
  }, {
    body: t.Object({
      token: t.String(),
      code: t.String({ minLength: 6, maxLength: 6 }),
      newPassword: t.String({ minLength: 6 })
    })
  })
  // Change Password (for authenticated users)
  .post('/change-password', async ({ body, headers, jwt, set }) => {
    try {
      const { currentPassword, newPassword } = body

      // Verify auth token
      const authHeader = headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        set.status = 401
        return { success: false, error: 'Not authenticated' }
      }

      const token = authHeader.split(' ')[1]
      const payload = await jwt.verify(token)

      if (!payload) {
        set.status = 401
        return { success: false, error: 'Invalid token' }
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: payload.userId as string }
      })

      if (!user) {
        set.status = 404
        return { success: false, error: 'User not found' }
      }

      // Check if user has a password (not Google-only)
      if (!user.password) {
        set.status = 400
        return { success: false, error: 'Cannot change password for accounts without a password' }
      }

      // Verify current password
      const isValid = await verifyPassword(currentPassword, user.password)
      if (!isValid) {
        set.status = 400
        return { success: false, error: 'Current password is incorrect' }
      }

      // Hash and update new password
      const hashedPassword = await hashPassword(newPassword)
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      })

      return { success: true, message: 'Password changed successfully' }
    } catch (error: any) {
      console.error('Change password error:', error)
      set.status = 500
      return { success: false, error: error.message }
    }
  }, {
    body: t.Object({
      currentPassword: t.String(),
      newPassword: t.String({ minLength: 6 })
    })
  })

