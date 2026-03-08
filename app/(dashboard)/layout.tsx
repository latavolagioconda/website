import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { gravatarUrl } from '@/lib/gravatar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/area-riservata')
  }

  const { data: socio, error: errSocio } = await supabase
    .from('soci')
    .select('nome, cognome, ruolo, nickname, avatar_url, email')
    .eq('auth_user_id', user.id)
    .single()

  // Se la query fallisce per errore DB (es. colonna mancante pre-migrazione), logga l'errore
  if (errSocio && !socio) console.error('[layout] errore query soci:', errSocio.message)

  // Utente autenticato ma non nella whitelist — forza il logout
  if (!socio) {
    await supabase.auth.signOut()
    redirect('/area-riservata')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        socio={{
          nome: socio.nome,
          cognome: socio.cognome,
          ruolo: socio.ruolo,
          nickname: socio.nickname,
          avatarSrc: socio.avatar_url || gravatarUrl(socio.email),
        }}
      />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}
