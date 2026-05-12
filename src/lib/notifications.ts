/**
 * Notification service — sends emails via Resend.
 * Also provides a cron-compatible endpoint for batch sending daily reminders.
 */

import { prisma } from '@/lib/prisma'
import { sendDailyReminderEmail, sendStreakWarningEmail } from '@/lib/email'

/**
 * Send daily reminder to a specific user (if they have notifications enabled).
 */
export async function sendDailyReminder(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, username: true, streak: true, timezone: true, notifyEmail: true, notifyPush: true },
  })

  if (!user) {
    console.log(`[notifications] sendDailyReminder: User ${userId} not found`)
    return
  }

  if (user.notifyEmail) {
    const result = await sendDailyReminderEmail(user.email, user.username, user.streak)
    if (result.success) {
      console.log(`[notifications] Daily reminder sent to ${user.email}`)
    } else {
      console.error(`[notifications] Failed to send daily reminder to ${user.email}:`, result.error)
    }
  }

  if (user.notifyPush) {
    // TODO: Wire up web-push when push subscription is implemented
    console.log(`[notifications] Push notification stub for ${user.username}`)
  }
}

/**
 * Send streak warning to a specific user (if they haven't played today and have a streak).
 */
export async function sendStreakWarning(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, username: true, streak: true, timezone: true, notifyEmail: true, notifyPush: true },
  })

  if (!user) {
    console.log(`[notifications] sendStreakWarning: User ${userId} not found`)
    return
  }

  if (user.streak === 0) return // no streak to warn about

  if (user.notifyEmail) {
    const result = await sendStreakWarningEmail(user.email, user.username, user.streak)
    if (result.success) {
      console.log(`[notifications] Streak warning sent to ${user.email}`)
    } else {
      console.error(`[notifications] Failed to send streak warning to ${user.email}:`, result.error)
    }
  }

  if (user.notifyPush) {
    console.log(`[notifications] Push streak warning stub for ${user.username}`)
  }
}

/**
 * Batch send daily reminders to all users with notifications enabled
 * who haven't played today yet. Call this from a cron job or API endpoint.
 */
export async function sendBatchDailyReminders(): Promise<{ sent: number; errors: number }> {
  const todayStr = new Date().toISOString().split('T')[0]
  const todayPuzzleId = `daily-${todayStr}`

  // Find users who have email notifications enabled but haven't played today
  const users = await prisma.user.findMany({
    where: {
      notifyEmail: true,
      NOT: {
        scores: {
          some: { puzzleId: todayPuzzleId },
        },
      },
    },
    select: { id: true, email: true, username: true, streak: true },
  })

  let sent = 0
  let errors = 0

  for (const user of users) {
    const result = await sendDailyReminderEmail(user.email, user.username, user.streak)
    if (result.success) {
      sent++
    } else {
      errors++
    }
    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  console.log(`[notifications] Batch daily reminders: ${sent} sent, ${errors} errors out of ${users.length} users`)
  return { sent, errors }
}

/**
 * Batch send streak warnings to users who haven't played today and have an active streak.
 * Best called in the evening (~6-8pm user's timezone).
 */
export async function sendBatchStreakWarnings(): Promise<{ sent: number; errors: number }> {
  const todayStr = new Date().toISOString().split('T')[0]
  const todayPuzzleId = `daily-${todayStr}`

  // Find users with active streaks who haven't played today
  const users = await prisma.user.findMany({
    where: {
      notifyEmail: true,
      streak: { gt: 2 }, // Only warn for 3+ day streaks
      NOT: {
        scores: {
          some: { puzzleId: todayPuzzleId },
        },
      },
    },
    select: { id: true, email: true, username: true, streak: true },
  })

  let sent = 0
  let errors = 0

  for (const user of users) {
    const result = await sendStreakWarningEmail(user.email, user.username, user.streak)
    if (result.success) {
      sent++
    } else {
      errors++
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  console.log(`[notifications] Batch streak warnings: ${sent} sent, ${errors} errors out of ${users.length} users`)
  return { sent, errors }
}
