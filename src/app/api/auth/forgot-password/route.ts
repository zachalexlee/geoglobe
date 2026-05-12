import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: 'If an account with that email exists, a reset link has been sent.',
      })
    }

    // Delete any existing reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: user.email },
    })

    // Generate a secure random token
    const token = randomBytes(32).toString('hex')

    // Store token with 1 hour expiry
    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        token,
        expires: new Date(Date.now() + 3600 * 1000), // 1 hour
      },
    })

    // Build the reset URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`

    // TODO: Send email with reset link when email service is configured
    // For now, log the reset link for development
    console.log(`[PASSWORD RESET] Reset link for ${user.email}: ${resetUrl}`)

    return NextResponse.json({
      message: 'If an account with that email exists, a reset link has been sent.',
      // Include reset URL in development for testing
      ...(process.env.NODE_ENV === 'development' && { resetUrl }),
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
