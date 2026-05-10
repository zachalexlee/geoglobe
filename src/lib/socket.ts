// ── Socket.io Server Integration (placeholder) ─────────────────────────────────
//
// NOTE: socket.io is included in package.json but we use Server-Sent Events (SSE)
// instead for the Versus real-time features. This is because:
//
// 1. Next.js 16 App Router does not support WebSocket upgrades in route handlers.
//    Route handlers are serverless/edge-compatible and don't expose raw HTTP sockets.
//
// 2. SSE works natively with Next.js streaming responses (`ReadableStream`) and
//    is fully supported on Railway's infrastructure.
//
// 3. For this use case (one-way server → client notifications), SSE is actually
//    the ideal protocol. The client only needs to receive events; all actions
//    (submit scores, join match) go through normal POST/PATCH API calls.
//
// If bidirectional WebSocket communication is needed in the future (e.g., live chat),
// consider one of these approaches:
//   - Deploy a separate socket.io server process on Railway
//   - Use a managed WebSocket service (Pusher, Ably, etc.)
//   - Add a custom Next.js server (loses some Next.js optimizations)
//
// The SSE pub/sub system lives in: src/lib/versus-events.ts
// The SSE endpoint lives in: src/app/api/versus/[matchId]/events/route.ts
// The client hook lives in: src/hooks/useVersusEvents.ts

export {}
