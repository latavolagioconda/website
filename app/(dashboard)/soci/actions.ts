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
  const password = formData.get('password') as string
  const confermaPassword = formData.get('conferma_password') as string

  if (!password || password.length < 8) {
    return { errore: 'La password deve essere di almeno 8 caratteri.' }
  }
  if (password !== confermaPassword) {
    return { errore: 'Le password non coincidono.' }
  }

  const admin = createAdminClient()

  // Crea l'utente su Supabase Auth con password temporanea
  const { data: nuovoUtente, error: erroreAuth } =
    await admin.auth.admin.createUser({
      email,
      password,
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

export async function aggiornaSocio(
  socioId: string,
  dati: {
    nome: string
    cognome: string
    email: string
    ruolo: string
    data_iscrizione: string
    badge: string[]
  }
): Promise<StatoSocio> {
  const admin_user = await verificaAdmin()
  if (!admin_user) return { errore: 'Accesso non autorizzato.' }

  const admin = createAdminClient()

  // Recupera il socio per ottenere auth_user_id e email attuale
  const { data: socioAttuale } = await admin
    .from('soci')
    .select('auth_user_id, email')
    .eq('id', socioId)
    .single()

  // Aggiorna la tabella soci
  const { error } = await admin
    .from('soci')
    .update(dati)
    .eq('id', socioId)

  if (error) return { errore: "Errore durante l'aggiornamento." }

  // Se l'email è cambiata, aggiorna anche l'utente Auth
  if (socioAttuale?.auth_user_id && socioAttuale.email !== dati.email) {
    await admin.auth.admin.updateUserById(socioAttuale.auth_user_id, {
      email: dati.email,
    })
  }

  revalidatePath('/soci')
  return { successo: true }
}

export async function resetPasswordSocio(
  socioId: string,
  nuovaPassword: string
): Promise<StatoSocio> {
  const admin_user = await verificaAdmin()
  if (!admin_user) return { errore: 'Accesso non autorizzato.' }

  if (!nuovaPassword || nuovaPassword.length < 8) {
    return { errore: 'La password deve essere di almeno 8 caratteri.' }
  }

  const admin = createAdminClient()

  const { data: socio } = await admin
    .from('soci')
    .select('auth_user_id')
    .eq('id', socioId)
    .single()

  if (!socio?.auth_user_id) return { errore: 'Socio non trovato.' }

  const { error } = await admin.auth.admin.updateUserById(socio.auth_user_id, {
    password: nuovaPassword,
  })

  if (error) return { errore: 'Errore durante il reset della password.' }

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
