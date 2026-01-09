import nodemailer from 'nodemailer'

// Gmail SMTP configuration
// IMPORTANT: Use App Password, NOT your regular Gmail password!
// 1. Enable 2-Factor Authentication on your Google account
// 2. Go to https://myaccount.google.com/apppasswords
// 3. Generate an App Password for "Mail"
// 4. Use that 16-character password as SMTP_PASSWORD

const createTransporter = () => {
  const email = process.env.SMTP_EMAIL
  const password = process.env.SMTP_PASSWORD

  if (!email || !password) {
    console.warn('⚠️ SMTP_EMAIL or SMTP_PASSWORD not set - emails will not be sent')
    return null
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: email,
      pass: password,
    },
    tls: {
      // Required for some environments
      rejectUnauthorized: false,
    },
  })
}

// Create transporter lazily
let transporter: nodemailer.Transporter | null = null

const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter()
  }
  return transporter
}

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const transport = getTransporter()
  
  if (!transport) {
    console.error('Email not configured - SMTP_EMAIL and SMTP_PASSWORD required')
    return { success: false, error: 'Email not configured' }
  }

  try {
    console.log(`📧 Sending email to ${to}...`)
    
    const info = await transport.sendMail({
      from: `"SalaPeso" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html,
    })
    
    console.log('✅ Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('❌ Email error:', error.message)
    console.error('Full error:', JSON.stringify(error, null, 2))
    
    // Provide helpful error messages
    if (error.code === 'EAUTH') {
      console.error('🔑 Authentication failed - make sure you are using an App Password, not your regular Gmail password')
      console.error('   Generate one at: https://myaccount.google.com/apppasswords')
    }
    
    return { success: false, error: error.message }
  }
}

export function generateResetCode(): string {
  // Generate 6-digit code
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function generateVerificationToken(): string {
  // Generate URL-safe token
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 48; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

export function getEmailVerificationHtml(verificationUrl: string, name?: string): string {
  const logoUrl = process.env.APP_LOGO_URL || 'https://qugnehrqqurqqpjgslfx.supabase.co/storage/v1/object/public/salapeso/salapeso-logo.png'

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 100%; max-width: 480px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header with Logo -->
              <tr>
                <td style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #e4e4e7;">
                  <img src="${logoUrl}" alt="SalaPeso" width="160" height="45" style="display: block; margin: 0 auto; max-width: 160px; height: auto;" />
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 32px;">
                  <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b;">
                    Verify Your Email Address
                  </h2>
                  <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #52525b;">
                    Hi${name ? ` ${name}` : ''},<br><br>
                    Welcome to SalaPeso! Please click the button below to verify your email address and activate your account.
                  </p>
                  
                  <!-- Verification Button -->
                  <div style="text-align: center; margin-bottom: 24px;">
                    <a href="${verificationUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: #7c3aed; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 8px;">
                      Verify Email Address
                    </a>
                  </div>
                  
                  <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #71717a;">
                    This link will expire in 24 hours. If the button doesn't work, copy and paste this link into your browser:
                  </p>
                  
                  <p style="margin: 0; font-size: 12px; word-break: break-all; color: #7c3aed;">
                    ${verificationUrl}
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 24px 32px; text-align: center; border-top: 1px solid #e4e4e7; background-color: #fafafa;">
                  <p style="margin: 0 0 8px; font-size: 12px; color: #71717a;">
                    If you didn't create an account with SalaPeso, you can safely ignore this email.
                  </p>
                  <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
                    © ${new Date().getFullYear()} SalaPeso. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

export function getPasswordResetEmailHtml(code: string, name?: string): string {
  const logoUrl = process.env.APP_LOGO_URL || 'https://qugnehrqqurqqpjgslfx.supabase.co/storage/v1/object/public/salapeso/salapeso-logo.png'

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 100%; max-width: 480px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header with Logo -->
              <tr>
                <td style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #e4e4e7;">
                  <img src="${logoUrl}" alt="SalaPeso" width="160" height="45" style="display: block; margin: 0 auto; max-width: 160px; height: auto;" />
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 32px;">
                  <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b;">
                    Reset Your Password
                  </h2>
                  <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #52525b;">
                    Hi${name ? ` ${name}` : ''},<br><br>
                    We received a request to reset your password. Use the code below to complete the process. This code will expire in 15 minutes.
                  </p>
                  
                  <!-- Code Box -->
                  <div style="background-color: #f4f4f5; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
                    <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #71717a;">
                      Your reset code
                    </p>
                    <p style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #18181b;">
                      ${code}
                    </p>
                  </div>
                  
                  <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #71717a;">
                    If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 24px 32px; text-align: center; border-top: 1px solid #e4e4e7; background-color: #fafafa;">
                  <p style="margin: 0 0 8px; font-size: 12px; color: #71717a;">
                    This email was sent by SalaPeso
                  </p>
                  <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
                    © ${new Date().getFullYear()} SalaPeso. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

