import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Dashboard — La Tavola Gioconda',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ count: contatoreSoci }, { data: prossimiEventi }] = await Promise.all([
    supabase
      .from('soci')
      .select('*', { count: 'exact', head: true })
      .eq('attivo', true),
    supabase
      .from('eventi')
      .select('id, titolo, tipo, data_inizio, luogo')
      .gte('data_inizio', new Date().toISOString())
      .order('data_inizio', { ascending: true })
      .limit(5),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Benvenuto nell&apos;area riservata.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Soci attivi</p>
          <p className="mt-1 text-3xl font-bold">{contatoreSoci ?? 0}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Prossimi eventi</p>
          <p className="mt-1 text-3xl font-bold">
            {prossimiEventi?.length ?? 0}
          </p>
        </div>
      </div>

      {prossimiEventi && prossimiEventi.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Prossimi appuntamenti</h2>
          <div className="space-y-3">
            {prossimiEventi.map((evento) => (
              <div key={evento.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{evento.titolo}</p>
                    {evento.luogo && (
                      <p className="text-sm text-muted-foreground">
                        {evento.luogo}
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      evento.tipo === 'torneo'
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}
                  >
                    {evento.tipo}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {new Date(evento.data_inizio).toLocaleDateString('it-IT', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!prossimiEventi || prossimiEventi.length === 0) && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">Nessun evento in programma.</p>
        </div>
      )}
    </div>
  )
}
