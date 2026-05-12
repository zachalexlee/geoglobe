import { NextRequest, NextResponse } from 'next/server'
import { sendBatchDailyReminders, sendBatchStreakWarnings } from '@/lib/notifications'

/**
 * POST /api/cron/notifications
 * 
 * Triggers batch notification sends. Protected by a secret token.
 * Call this from a cron job (e.g. Railway cron, Vercel cron, or external service).
 * 
 * Body: { type: 'daily-reminder' | 'streak-warning' }
 * Header: Authorization: Bearer <CRON_SECRET>
 */
export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { type } = await req.json()

    if (type === 'daily-reminder') {
      const result = await sendBatchDailyReminders()
      return NextResponse.json({ success: true, ...result })
    }

    if (type === 'streak-warning') {
      const result = await sendBatchStreakWarnings()
      return NextResponse.json({ success: true, ...result })
    }

    return NextResponse.json({ error: 'Invalid type. Use "daily-reminder" or "streak-warning".' }, { status: 400 })
  } catch (error) {
    console.error('Cron notifications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
