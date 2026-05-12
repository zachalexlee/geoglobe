import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GLOBE_SKINS } from '@/lib/globe-skins'

/**
 * GET /api/user/skin — Get the user's currently selected skin
 * POST /api/user/skin — Set the user's selected skin
 */
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { selectedSkin: true, isPremium: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      selectedSkin: user.selectedSkin,
      isPremium: user.isPremium,
      availableSkins: GLOBE_SKINS.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        icon: s.icon,
        isPremium: s.isPremium,
        locked: s.isPremium && !user.isPremium,
      })),
    })
  } catch (error) {
    console.error('skin GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { skinId } = await req.json()

    if (!skinId || typeof skinId !== 'string') {
      return NextResponse.json({ error: 'Invalid skin ID' }, { status: 400 })
    }

    const skin = GLOBE_SKINS.find((s) => s.id === skinId)
    if (!skin) {
      return NextResponse.json({ error: 'Skin not found' }, { status: 404 })
    }

    // Check premium requirement
    if (skin.isPremium) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isPremium: true },
      })

      if (!user?.isPremium) {
        return NextResponse.json(
          { error: 'Premium subscription required for this skin' },
          { status: 403 }
        )
      }
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { selectedSkin: skinId },
      select: { selectedSkin: true },
    })

    return NextResponse.json({
      success: true,
      selectedSkin: updated.selectedSkin,
    })
  } catch (error) {
    console.error('skin POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
