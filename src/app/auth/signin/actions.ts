'use server'

import { signIn } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AuthError } from 'next-auth'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const callbackUrl = (formData.get('callbackUrl') as string) || '/'

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: callbackUrl,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === 'CredentialsSignin') {
        redirect(`/auth/signin?error=CredentialsSignin&callbackUrl=${encodeURIComponent(callbackUrl)}`)
      }
      redirect(`/auth/signin?error=${error.type}&callbackUrl=${encodeURIComponent(callbackUrl)}`)
    }
    // NEXT_REDIRECT throws an error that should be re-thrown
    throw error
  }
}
