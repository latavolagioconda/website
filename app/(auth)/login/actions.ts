'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type StatoLogin = { errore: string } | null

export async function login(
  prevState: StatoLogin,
  formData: FormData
): Promise<StatoLogin> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { errore: 'Credenziali non valide. Verifica email e password.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
