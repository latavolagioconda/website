import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { CalendarDays, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { AggiungiEventoDialog } from '@/components/eventi/aggiungi-evento-dialog'
import { EliminaEventoButton } from '@/components/eventi/elimina-evento-button'
import { ModificaEventoDialog } from '@/components/eventi/modifica-evento-dialog'

export const metadata: Metadata = {
  title: 'Eventi — La Tavola Gioconda',
}

export default async function EventiPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: eventi }, { data: socioCorrente }] =
    await Promise.all([
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

  if (!socioCorrente) redirect('/login')

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

      {(!eventi || eventi.length === 0) && (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">Nessun evento in programma.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {eventi?.map((evento) => {
          return (
            <div
              key={evento.id}
              className="flex flex-col gap-4 rounded-lg border bg-card p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold leading-tight">{evento.titolo}</h2>
                <Badge
                  className="shrink-0"
                  variant={evento.tipo === 'torneo' ? 'default' : 'secondary'}
                >
                  {evento.tipo}
                </Badge>
              </div>

              {evento.descrizione && (
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {evento.descrizione}
                </p>
              )}

              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 shrink-0" />
                  <span>
                    {new Date(evento.data_inizio).toLocaleDateString('it-IT', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                    {', '}
                    {new Date(evento.data_inizio).toLocaleTimeString('it-IT', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {evento.luogo && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{evento.luogo}</span>
                  </div>
                )}
              </div>

              {isAdmin && (
                <div className="mt-auto flex items-center justify-end gap-2">
                  <ModificaEventoDialog evento={evento} />
                  <EliminaEventoButton eventoId={evento.id} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
