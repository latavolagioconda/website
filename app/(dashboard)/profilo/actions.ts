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
  const social_x = (formData.get('social_x') as string) || null
  const social_instagram = (formData.get('social_instagram') as string) || null
  const social_bluesky = (formData.get('social_bluesky') as string) || null
  const social_facebook = (formData.get('social_facebook') as string) || null
  const social_discord = (formData.get('social_discord') as string) || null
  const social_steam = (formData.get('social_steam') as string) || null

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
      social_x,
      social_instagram,
      social_bluesky,
      social_facebook,
      social_discord,
      social_steam,
    })
    .eq('auth_user_id', user.id)

  if (error) return { errore: 'Errore durante il salvataggio. Riprova.' }

  revalidatePath('/profilo')
  return { successo: true }
}

export async function cambiaPassword(
  prevState: StatoProfilo,
  formData: FormData
): Promise<StatoProfilo> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { errore: 'Non autenticato.' }

  const nuovaPassword = formData.get('nuova_password') as string
  const confermaPassword = formData.get('conferma_password') as string

  if (!nuovaPassword || nuovaPassword.length < 8) {
    return { errore: 'La password deve essere di almeno 8 caratteri.' }
  }
  if (nuovaPassword !== confermaPassword) {
    return { errore: 'Le password non coincidono.' }
  }

  const { error } = await supabase.auth.updateUser({ password: nuovaPassword })

  if (error) return { errore: 'Errore durante il cambio password. Riprova.' }

  return { successo: true }
}
