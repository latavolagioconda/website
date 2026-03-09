'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type StatoEvento = { errore?: string; successo?: boolean } | null

async function getSocioCorrente() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: socio } = await supabase
    .from('soci')
    .select('id, ruolo')
    .eq('auth_user_id', user.id)
    .single()

  return socio
}

export async function creaEvento(
  prevState: StatoEvento,
  formData: FormData
): Promise<StatoEvento> {
  const socio = await getSocioCorrente()
  if (!socio || socio.ruolo !== 'admin') return { errore: 'Accesso non autorizzato.' }

  const titolo = formData.get('titolo') as string
  const descrizione = (formData.get('descrizione') as string) || null
  const tipo = formData.get('tipo') as string
  const data_inizio = formData.get('data_inizio') as string
  const data_fine = (formData.get('data_fine') as string) || null
  const luogo = (formData.get('luogo') as string) || null
  const pubblico = formData.get('pubblico') === 'on'

  const supabase = await createClient()
  const { error } = await supabase.from('eventi').insert({
    titolo,
    descrizione,
    tipo,
    data_inizio,
    data_fine,
    luogo,
    pubblico,
    creato_da: socio.id,
  })

  if (error) return { errore: "Errore durante la creazione dell'evento." }

  revalidatePath('/eventi')
  revalidatePath('/')
  return { successo: true }
}

export async function modificaEvento(
  prevState: StatoEvento,
  formData: FormData
): Promise<StatoEvento> {
  const socio = await getSocioCorrente()
  if (!socio || socio.ruolo !== 'admin') return { errore: 'Accesso non autorizzato.' }

  const id = formData.get('id') as string
  const titolo = formData.get('titolo') as string
  const descrizione = (formData.get('descrizione') as string) || null
  const tipo = formData.get('tipo') as string
  const data_inizio = formData.get('data_inizio') as string
  const data_fine = (formData.get('data_fine') as string) || null
  const luogo = (formData.get('luogo') as string) || null
  const pubblico = formData.get('pubblico') === 'on'

  const supabase = await createClient()
  const { error } = await supabase
    .from('eventi')
    .update({ titolo, descrizione, tipo, data_inizio, data_fine, luogo, pubblico })
    .eq('id', id)

  if (error) return { errore: "Errore durante la modifica dell'evento." }

  revalidatePath('/eventi')
  revalidatePath('/')
  return { successo: true }
}

export async function eliminaEvento(eventoId: string): Promise<StatoEvento> {
  const socio = await getSocioCorrente()
  if (!socio || socio.ruolo !== 'admin') return { errore: 'Accesso non autorizzato.' }

  const supabase = await createClient()
  const { error } = await supabase.from('eventi').delete().eq('id', eventoId)

  if (error) return { errore: "Errore durante l'eliminazione." }

  revalidatePath('/eventi')
  revalidatePath('/')
  return { successo: true }
}

