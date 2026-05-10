import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimit } from './lib/rate-limiter'

// ---------------------------------------------------------------------------
// Rate-limit rules
// Each entry: [pathPrefix, requestsPerWindow, windowMs]
// ---------------------------------------------------------------------------
const RATE_LIMIT_RULES: [string, number, number][] = [
  ['/api/scores', 10, 60_000],          // 10 req / minute
  ['/api/auth/register', 5, 3_600_000], // 5 req / hour
  ['/api/versus', 20, 60_000],          // 20 req / minute
  ['/api/leaderboard', 30, 60_000],     // 30 req / minute
]

function getClientIp(req: NextRequest): string {
  const forwarded =
    req.headers.get('x-forwarded-for') ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1'
  return forwarded.split(',')[0].trim()
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ------------------------------------------------------------------
  // Rate limiting – checked before auth so bots are rejected cheaply
  // ------------------------------------------------------------------
  for (const [prefix, limit, windowMs] of RATE_LIMIT_RULES) {
    if (pathname.startsWith(prefix)) {
      const ip = getClientIp(req)
      const key = `rl:${prefix}:${ip}`
      const result = rateLimit(key, limit, windowMs)

      if (!result.allowed) {
        const retryAfterSec = Math.ceil((result.resetAt - Date.now()) / 1000)
        return new NextResponse(
          JSON.stringify({ error: 'Too Many Requests' }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': String(retryAfterSec),
              'X-RateLimit-Limit': String(limit),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
            },
          },
        )
      }
      break
    }
  }

  // ------------------------------------------------------------------
  // Auth redirect logic — check for session cookie presence
  // Next-Auth v5 uses __Secure-authjs.session-token on HTTPS
  // ------------------------------------------------------------------
  const sessionCookie =
    req.cookies.get('__Secure-authjs.session-token') ??
    req.cookies.get('authjs.session-token') ??
    req.cookies.get('next-auth.session-token')

  const isLoggedIn = !!sessionCookie?.value
  const isAuthRoute = pathname.startsWith('/auth')
  const isApiAuth = pathname.startsWith('/api/auth')
  const isProtected = ['/play', '/groups', '/versus', '/profile'].some(
    (path) => pathname.startsWith(path),
  )

  if (isAuthRoute || isApiAuth) return NextResponse.next()
  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL('/auth/signin', req.nextUrl))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
