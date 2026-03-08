'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type StatoProfilo = { errore?: string; successo?: boolean } | null

export async function aggiornaProfilo(
  prevState: StatoProfilo,
  formData: FormData
): Promise<StatoProfilo> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { errore: 'Non autenticato.' }

  const nickname = (formData.get('nickname') as string) || null
  const bio = (formData.get('bio') as string) || null
  const telefono = (formData.get('telefono') as string) || null
  const avatar_url = (formData.get('avatar_url') as string) || null
  const data_nascita = (formData.get('data_nascita') as string) || null

  const giochiStr = (formData.get('giochi_preferiti') as string) || ''
  const giochi_preferiti = giochiStr
    ? giochiStr.split(',').map((g) => g.trim()).filter(Boolean)
    : null

  const pubblica_nome_completo = formData.get('pubblica_nome_completo') === 'on'
  const pubblica_bio = formData.get('pubblica_bio') === 'on'
  const pubblica_giochi = formData.get('pubblica_giochi') === 'on'
  const pubblica_email = formData.get('pubblica_email') === 'on'
  const pubblica_telefono = formData.get('pubblica_telefono') === 'on'
  const pubblica_data_nascita = formData.get('pubblica_data_nascita') === 'on'

  const { error } = await supabase
    .from('soci')
    .update({
      nickname,
      bio,
      telefono,
      avatar_url,
      data_nascita,
      giochi_preferiti,
      pubblica_nome_completo,
      pubblica_bio,
      pubblica_giochi,
      pubblica_email,
      pubblica_telefono,
      pubblica_data_nascita,
    })
    .eq('auth_user_id', user.id)

  if (error) return { errore: 'Errore durante il salvataggio. Riprova.' }

  revalidatePath('/profilo')
  return { successo: true }
}
