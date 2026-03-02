import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'

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
    redirect('/login')
  }

  const { data: socio } = await supabase
    .from('soci')
    .select('nome, cognome, ruolo')
    .eq('auth_user_id', user.id)
    .single()

  // Utente autenticato ma non nella whitelist — forza il logout
  if (!socio) {
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar nome={socio.nome} cognome={socio.cognome} ruolo={socio.ruolo} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}
