import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AggiungiEventoDialog } from '@/components/eventi/aggiungi-evento-dialog'
import { CalendarioEventi } from '@/components/eventi/calendario-eventi'

export const metadata: Metadata = {
  title: 'Eventi — La Tavola Gioconda',
}

export default async function EventiPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/area-riservata')

  const [{ data: eventi }, { data: socioCorrente }] = await Promise.all([
    supabase
      .from('eventi')
      .select('*')
      .order('data_inizio', { ascending: true }),
    supabase
      .from('soci')
      .select('id, ruolo')
      .eq('auth_user_id', user.id)
      .single(),
  ])

  if (!socioCorrente) redirect('/area-riservata')

  const isAdmin = socioCorrente.ruolo === 'admin'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Eventi</h1>
          <p className="text-muted-foreground">
            {eventi?.length ?? 0}{' '}
            {(eventi?.length ?? 0) === 1 ? 'evento' : 'eventi'} in programma
          </p>
        </div>
        {isAdmin && <AggiungiEventoDialog />}
      </div>

      <CalendarioEventi eventi={eventi ?? []} isAdmin={isAdmin} />
    </div>
  )
}
