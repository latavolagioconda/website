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
  const maxStr = formData.get('max_partecipanti') as string
  const max_partecipanti = maxStr ? parseInt(maxStr) : null
  const pubblico = formData.get('pubblico') === 'on'

  const supabase = await createClient()
  const { error } = await supabase.from('eventi').insert({
    titolo,
    descrizione,
    tipo,
    data_inizio,
    data_fine,
    luogo,
    max_partecipanti,
    pubblico,
    creato_da: socio.id,
  })

  if (error) return { errore: "Errore durante la creazione dell'evento." }

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

export async function togglIscrizione(
  eventoId: string,
  iscritto: boolean
): Promise<StatoEvento> {
  const socio = await getSocioCorrente()
  if (!socio) return { errore: 'Non autenticato.' }

  const supabase = await createClient()

  if (iscritto) {
    const { error } = await supabase
      .from('partecipazioni')
      .delete()
      .eq('evento_id', eventoId)
      .eq('socio_id', socio.id)

    if (error) return { errore: 'Errore durante la disiscrizione.' }
  } else {
    // Verifica limite posti disponibili
    const { count } = await supabase
      .from('partecipazioni')
      .select('*', { count: 'exact', head: true })
      .eq('evento_id', eventoId)

    const { data: evento } = await supabase
      .from('eventi')
      .select('max_partecipanti')
      .eq('id', eventoId)
      .single()

    if (
      evento?.max_partecipanti &&
      count !== null &&
      count >= evento.max_partecipanti
    ) {
      return { errore: 'Evento al completo.' }
    }

    const { error } = await supabase.from('partecipazioni').insert({
      evento_id: eventoId,
      socio_id: socio.id,
    })

    if (error) return { errore: "Errore durante l'iscrizione." }
  }

  revalidatePath('/eventi')
  return { successo: true }
}
