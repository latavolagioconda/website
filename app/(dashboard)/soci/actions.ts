'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

function generaSlug(): string {
  // Slug anonimo: 12 caratteri alfanumerici casuali, es. "a3k9mf2xq8tz"
  return Array.from({ length: 12 }, () =>
    Math.random().toString(36)[2]
  ).join('')
}

export type StatoSocio = { errore?: string; successo?: boolean; slug?: string } | null

async function verificaAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: socio } = await supabase
    .from('soci')
    .select('ruolo')
    .eq('auth_user_id', user.id)
    .single()

  return socio?.ruolo === 'admin' ? user : null
}

export async function aggiungiSocio(
  prevState: StatoSocio,
  formData: FormData
): Promise<StatoSocio> {
  const admin_user = await verificaAdmin()
  if (!admin_user) return { errore: 'Accesso non autorizzato.' }

  const nome = formData.get('nome') as string
  const cognome = formData.get('cognome') as string
  const email = formData.get('email') as string
  const ruolo = formData.get('ruolo') as string

  const admin = createAdminClient()

  // Crea l'utente su Supabase Auth e invia email per impostare la password
  const { data: nuovoUtente, error: erroreAuth } =
    await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { nome, cognome, ruolo },
    })

  if (erroreAuth) {
    if (erroreAuth.message.toLowerCase().includes('already')) {
      return { errore: 'Esiste già un utente con questa email.' }
    }
    return { errore: "Errore durante la creazione dell'utente." }
  }

  // Inserisce il record nella tabella soci
  const { error: erroreDB } = await admin.from('soci').insert({
    auth_user_id: nuovoUtente.user.id,
    nome,
    cognome,
    email,
    ruolo,
  })

  if (erroreDB) {
    // Rollback: elimina l'utente Auth appena creato
    await admin.auth.admin.deleteUser(nuovoUtente.user.id)
    return { errore: 'Errore durante il salvataggio. Riprova.' }
  }

  revalidatePath('/soci')
  return { successo: true }
}

export async function gestisciProfiloPubblico(
  socioId: string,
  azione: 'genera' | 'rigenera' | 'toggle',
  abilitatoCorrente?: boolean
): Promise<StatoSocio> {
  const admin_user = await verificaAdmin()
  if (!admin_user) return { errore: 'Accesso non autorizzato.' }

  const admin = createAdminClient()

  if (azione === 'toggle') {
    const { error } = await admin
      .from('profili_pubblici')
      .update({ abilitato: !abilitatoCorrente })
      .eq('socio_id', socioId)
    if (error) return { errore: "Errore durante l'aggiornamento." }
    revalidatePath('/soci')
    return { successo: true }
  } else {
    // genera o rigenera: upsert con nuovo slug
    const slug = generaSlug()
    const { error } = await admin
      .from('profili_pubblici')
      .upsert({ socio_id: socioId, slug, abilitato: true }, { onConflict: 'socio_id' })
    if (error) return { errore: 'Errore durante la generazione del link.' }
    revalidatePath('/soci')
    return { successo: true, slug }
  }
}

export async function aggiornaBadgeSocio(
  socioId: string,
  badge: string[]
): Promise<StatoSocio> {
  const admin_user = await verificaAdmin()
  if (!admin_user) return { errore: 'Accesso non autorizzato.' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('soci')
    .update({ badge })
    .eq('id', socioId)

  if (error) return { errore: "Errore durante l'aggiornamento dei badge." }

  revalidatePath('/soci')
  return { successo: true }
}

export async function toggleAttivoSocio(
  socioId: string,
  attivoCorrente: boolean
): Promise<StatoSocio> {
  const admin_user = await verificaAdmin()
  if (!admin_user) return { errore: 'Accesso non autorizzato.' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('soci')
    .update({ attivo: !attivoCorrente })
    .eq('id', socioId)

  if (error) return { errore: "Errore durante l'aggiornamento." }

  revalidatePath('/soci')
  return { successo: true }
}
