import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { email, username, password, referralCode } = await req.json()

    if (!email || !username || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    })
    if (existing) {
      return NextResponse.json({ error: 'Email or username already taken' }, { status: 409 })
    }

    // Check if referral code is valid
    let referrer: { id: string } | null = null
    if (referralCode && typeof referralCode === 'string') {
      referrer = await prisma.user.findUnique({
        where: { referralCode },
        select: { id: true },
      })
      // We don't error if referral code is invalid — just ignore it
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        referredById: referrer?.id ?? undefined,
        // Give 50 XP bonus to new user if they used a valid referral code
        xp: referrer ? 50 : 0,
      },
      select: { id: true, email: true, username: true },
    })

    // If valid referral, create referral record and award XP to referrer
    if (referrer) {
      await prisma.referral.create({
        data: {
          referrerId: referrer.id,
          referredId: user.id,
          xpAwarded: 100,
        },
      })

      // Award 100 XP to the referrer
      await prisma.user.update({
        where: { id: referrer.id },
        data: { xp: { increment: 100 } },
      })
    }

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
