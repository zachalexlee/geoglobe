import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// GET /api/user/referral — get referral code + stats
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Ensure user has a referral code (auto-generate on first access)
    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.referralCode) {
      // Generate a unique referral code
      let code = generateReferralCode()
      let attempts = 0
      while (attempts < 10) {
        const existing = await prisma.user.findUnique({ where: { referralCode: code } })
        if (!existing) break
        code = generateReferralCode()
        attempts++
      }

      user = await prisma.user.update({
        where: { id: userId },
        data: { referralCode: code },
        select: { referralCode: true },
      })
    }

    // Get referral stats
    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      select: { xpAwarded: true, createdAt: true },
    })

    const totalReferred = referrals.length
    const totalXpEarned = referrals.reduce((sum, r) => sum + r.xpAwarded, 0)

    return NextResponse.json({
      referralCode: user.referralCode,
      totalReferred,
      totalXpEarned,
    })
  } catch (error) {
    console.error('referral GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
