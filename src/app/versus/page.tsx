import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import VersusClient from '@/components/versus/VersusClient'

export const metadata = {
  title: 'Versus Mode – GeoGlobe',
  description: 'Challenge another player in real-time',
}

// ── Server Component wrapper — handles auth then delegates to client ───────────

export default async function VersusPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/versus')
  }

  const userId = session.user.id

  return <VersusClient userId={userId} />
}
