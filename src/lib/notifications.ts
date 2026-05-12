/**
 * Notification stubs — these log what they would send.
 * In production, connect to an email service (e.g. Resend, SendGrid)
 * and a push notification service (e.g. web-push, OneSignal).
 */

import { prisma } from '@/lib/prisma'

export async function sendDailyReminder(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, username: true, timezone: true, notifyEmail: true, notifyPush: true },
  })

  if (!user) {
    console.log(`[notifications] sendDailyReminder: User ${userId} not found`)
    return
  }

  if (user.notifyEmail) {
    console.log(
      `[notifications] WOULD SEND EMAIL to ${user.email}: ` +
      `"Hey ${user.username}! 🌍 Your daily GeoGlobe puzzle is ready. ` +
      `Don't break your streak!" (timezone: ${user.timezone})`
    )
  }

  if (user.notifyPush) {
    console.log(
      `[notifications] WOULD SEND PUSH to ${user.username}: ` +
      `"🌍 Daily puzzle is live! Play now to keep your streak going."`
    )
  }

  if (!user.notifyEmail && !user.notifyPush) {
    console.log(
      `[notifications] sendDailyReminder: User ${user.username} has all notifications disabled`
    )
  }
}

export async function sendStreakWarning(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, username: true, streak: true, timezone: true, notifyEmail: true, notifyPush: true },
  })

  if (!user) {
    console.log(`[notifications] sendStreakWarning: User ${userId} not found`)
    return
  }

  if (user.notifyEmail) {
    console.log(
      `[notifications] WOULD SEND EMAIL to ${user.email}: ` +
      `"⚠️ ${user.username}, your ${user.streak}-day streak is about to end! ` +
      `Play today's puzzle before midnight to keep it alive." (timezone: ${user.timezone})`
    )
  }

  if (user.notifyPush) {
    console.log(
      `[notifications] WOULD SEND PUSH to ${user.username}: ` +
      `"⚠️ Your ${user.streak}-day streak ends tonight! Play now to save it."`
    )
  }

  if (!user.notifyEmail && !user.notifyPush) {
    console.log(
      `[notifications] sendStreakWarning: User ${user.username} has all notifications disabled`
    )
  }
}
