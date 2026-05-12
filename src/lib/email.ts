import { Resend } from 'resend'

// Lazy-initialize Resend client — avoids build-time failure when env var is missing
let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

// Default "from" address — use onboarding@resend.dev for testing,
// switch to your own domain once verified in Resend dashboard
const FROM_ADDRESS = process.env.EMAIL_FROM || 'GeoGlobe <onboarding@resend.dev>'

// ── Email Templates ─────────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(
  to: string,
  username: string,
  resetUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await getResend().emails.send({
      from: FROM_ADDRESS,
      to,
      subject: '🌍 Reset your GeoGlobe password',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #111; color: #fff; border-radius: 16px; padding: 40px; border: 1px solid #222;">
          <div style="text-align: center; margin-bottom: 32px;">
            <span style="font-size: 48px;">🌍</span>
            <h1 style="color: #fff; margin: 12px 0 4px; font-size: 24px;">GeoGlobe</h1>
            <p style="color: #888; margin: 0; font-size: 14px;">Password Reset</p>
          </div>
          <p style="color: #ccc; font-size: 15px; line-height: 1.6;">
            Hey <strong>${username}</strong>,
          </p>
          <p style="color: #ccc; font-size: 15px; line-height: 1.6;">
            We received a request to reset your password. Click the button below to set a new one:
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 13px; line-height: 1.5;">
            This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #222; margin: 24px 0;" />
          <p style="color: #555; font-size: 12px; text-align: center;">
            GeoGlobe — Daily Geography Game<br/>
            <a href="https://geoglobe-production.up.railway.app" style="color: #2563eb; text-decoration: none;">geoglobe-production.up.railway.app</a>
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('[email] sendPasswordResetEmail failed:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('[email] sendPasswordResetEmail exception:', err)
    return { success: false, error: String(err) }
  }
}

export async function sendDailyReminderEmail(
  to: string,
  username: string,
  streak: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const streakLine = streak > 0
      ? `<p style="color: #f59e0b; font-size: 15px;">🔥 You're on a <strong>${streak}-day streak</strong>! Don't let it slip.</p>`
      : ''

    const { error } = await getResend().emails.send({
      from: FROM_ADDRESS,
      to,
      subject: `🌍 Your daily GeoGlobe puzzle is ready!`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #111; color: #fff; border-radius: 16px; padding: 40px; border: 1px solid #222;">
          <div style="text-align: center; margin-bottom: 32px;">
            <span style="font-size: 48px;">🌍</span>
            <h1 style="color: #fff; margin: 12px 0 4px; font-size: 24px;">GeoGlobe</h1>
          </div>
          <p style="color: #ccc; font-size: 15px; line-height: 1.6;">
            Hey <strong>${username}</strong>! A new daily geography puzzle is waiting for you.
          </p>
          ${streakLine}
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://geoglobe-production.up.railway.app/play" style="display: inline-block; background: #14b8a6; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
              Play Today's Puzzle
            </a>
          </div>
          <p style="color: #666; font-size: 13px; line-height: 1.5;">
            5 cities. One globe. How well do you know the world?
          </p>
          <hr style="border: none; border-top: 1px solid #222; margin: 24px 0;" />
          <p style="color: #555; font-size: 12px; text-align: center;">
            You're receiving this because you enabled daily reminders.<br/>
            <a href="https://geoglobe-production.up.railway.app/profile/notifications" style="color: #2563eb; text-decoration: none;">Manage preferences</a>
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('[email] sendDailyReminderEmail failed:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('[email] sendDailyReminderEmail exception:', err)
    return { success: false, error: String(err) }
  }
}

export async function sendStreakWarningEmail(
  to: string,
  username: string,
  streak: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await getResend().emails.send({
      from: FROM_ADDRESS,
      to,
      subject: `⚠️ Your ${streak}-day streak is about to end!`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #111; color: #fff; border-radius: 16px; padding: 40px; border: 1px solid #222;">
          <div style="text-align: center; margin-bottom: 32px;">
            <span style="font-size: 48px;">⚠️</span>
            <h1 style="color: #f59e0b; margin: 12px 0 4px; font-size: 24px;">Streak Alert!</h1>
          </div>
          <p style="color: #ccc; font-size: 15px; line-height: 1.6;">
            <strong>${username}</strong>, your <span style="color: #f59e0b; font-weight: bold;">${streak}-day streak</span> ends tonight!
          </p>
          <p style="color: #ccc; font-size: 15px; line-height: 1.6;">
            Play today's puzzle before midnight to keep your streak alive. Don't lose all that progress!
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://geoglobe-production.up.railway.app/play" style="display: inline-block; background: #ef4444; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
              Play Now — Save Your Streak
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #222; margin: 24px 0;" />
          <p style="color: #555; font-size: 12px; text-align: center;">
            <a href="https://geoglobe-production.up.railway.app/profile/notifications" style="color: #2563eb; text-decoration: none;">Manage notification preferences</a>
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('[email] sendStreakWarningEmail failed:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('[email] sendStreakWarningEmail exception:', err)
    return { success: false, error: String(err) }
  }
}

export async function sendWelcomeEmail(
  to: string,
  username: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await getResend().emails.send({
      from: FROM_ADDRESS,
      to,
      subject: '🌍 Welcome to GeoGlobe!',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #111; color: #fff; border-radius: 16px; padding: 40px; border: 1px solid #222;">
          <div style="text-align: center; margin-bottom: 32px;">
            <span style="font-size: 48px;">🌍</span>
            <h1 style="color: #fff; margin: 12px 0 4px; font-size: 24px;">Welcome to GeoGlobe!</h1>
          </div>
          <p style="color: #ccc; font-size: 15px; line-height: 1.6;">
            Hey <strong>${username}</strong>! You've just joined the global community of geography enthusiasts.
          </p>
          <p style="color: #ccc; font-size: 15px; line-height: 1.6;">
            Here's what's waiting for you:
          </p>
          <ul style="color: #ccc; font-size: 14px; line-height: 1.8; padding-left: 20px;">
            <li>🗓️ <strong>Daily puzzles</strong> — A new challenge every day</li>
            <li>⚡ <strong>Time Attack</strong> — Race against the clock</li>
            <li>👥 <strong>Multiplayer rooms</strong> — Challenge friends live</li>
            <li>🏆 <strong>Tournaments</strong> — Compete for the top spot</li>
            <li>🎯 <strong>Practice maps</strong> — Sharpen your skills by region</li>
          </ul>
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://geoglobe-production.up.railway.app/play" style="display: inline-block; background: #14b8a6; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
              Play Your First Puzzle
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #222; margin: 24px 0;" />
          <p style="color: #555; font-size: 12px; text-align: center;">
            GeoGlobe — Daily Geography Game
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('[email] sendWelcomeEmail failed:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('[email] sendWelcomeEmail exception:', err)
    return { success: false, error: String(err) }
  }
}

export async function sendReferralRewardEmail(
  to: string,
  username: string,
  referredUsername: string,
  xpEarned: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await getResend().emails.send({
      from: FROM_ADDRESS,
      to,
      subject: `🎉 ${referredUsername} joined GeoGlobe — you earned ${xpEarned} XP!`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #111; color: #fff; border-radius: 16px; padding: 40px; border: 1px solid #222;">
          <div style="text-align: center; margin-bottom: 32px;">
            <span style="font-size: 48px;">🎉</span>
            <h1 style="color: #14b8a6; margin: 12px 0 4px; font-size: 24px;">Referral Reward!</h1>
          </div>
          <p style="color: #ccc; font-size: 15px; line-height: 1.6;">
            <strong>${username}</strong>, your friend <strong>${referredUsername}</strong> just joined GeoGlobe using your referral link!
          </p>
          <p style="color: #14b8a6; font-size: 18px; font-weight: bold; text-align: center;">
            +${xpEarned} XP earned 🎯
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://geoglobe-production.up.railway.app/profile/referrals" style="display: inline-block; background: #14b8a6; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
              View Referral Stats
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #222; margin: 24px 0;" />
          <p style="color: #555; font-size: 12px; text-align: center;">
            Keep sharing your code to earn more XP!
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('[email] sendReferralRewardEmail failed:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('[email] sendReferralRewardEmail exception:', err)
    return { success: false, error: String(err) }
  }
}
