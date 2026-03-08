import type { Metadata } from 'next'
import { NavbarPubblica } from '@/components/homepage/navbar-pubblica'
import { CalendarioPubblico } from '@/components/homepage/calendario-pubblico'
import { createClient } from '@/lib/supabase/server'
import { MapPin, Clock, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'La Tavola Gioconda — Associazione Ludica',
  description: 'Associazione ludica dedicata ai giochi da tavolo. Unisciti a noi per eventi, tornei e serate di gioco.',
}

async function getEventiFuturi() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('eventi')
    .select('id, titolo, descrizione, tipo, data_inizio, data_fine, luogo, max_partecipanti')
    .eq('pubblico', true)
    .gte('data_inizio', new Date().toISOString())
    .order('data_inizio', { ascending: true })
    .limit(9)

  return data ?? []
}

export default async function HomePage() {
  const eventi = await getEventiFuturi()

  return (
    <div className="min-h-screen bg-background">
      <NavbarPubblica />

      {/* Hero */}
      <section className="border-b bg-muted/30 py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            La Tavola Gioconda
          </h1>
          <p className="mt-4 text-xl text-muted-foreground">
            La nostra passione? I giochi da tavolo. Il nostro posto? Un tavolo (o due, o tre).
          </p>
          <p className="mt-6 text-muted-foreground max-w-2xl mx-auto">
            {/* TODO: aggiorna con la descrizione ufficiale dell'associazione */}
            Siamo un'associazione di appassionati di giochi da tavolo che si riunisce regolarmente
            per giocare, condividere nuove scoperte e organizzare tornei. Tutti sono benvenuti,
            dal neofita al veterano.
          </p>
        </div>
      </section>

      {/* Chi siamo + dove siamo */}
      <section className="py-16 px-4 border-b">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold mb-10 text-center">Chi siamo e dove ci troviamo</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="rounded-full bg-muted p-3">
                <MapPin className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold">Dove siamo</h3>
              <p className="text-sm text-muted-foreground">
                {/* TODO: inserisci l'indirizzo reale */}
                Via Esempio, 1<br />
                00100 Roma (RM)
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="rounded-full bg-muted p-3">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold">Orari</h3>
              <p className="text-sm text-muted-foreground">
                {/* TODO: inserisci gli orari reali */}
                Venerdì: 20:00 – 23:30<br />
                Sabato: 15:00 – 23:30
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="rounded-full bg-muted p-3">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold">Come partecipare</h3>
              <p className="text-sm text-muted-foreground">
                {/* TODO: aggiorna con le istruzioni reali */}
                Contattaci per entrare a far parte dell&apos;associazione.
                L&apos;iscrizione è aperta tutto l&apos;anno.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Calendario eventi pubblici */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold mb-2">Prossimi eventi</h2>
          <p className="text-muted-foreground mb-8">
            Tornei, serate di gioco e molto altro. Tutti gli eventi aperti al pubblico.
          </p>
          <CalendarioPubblico eventi={eventi} />
        </div>
      </section>

      <footer className="border-t py-8 px-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} La Tavola Gioconda — Tutti i diritti riservati
      </footer>
    </div>
  )
}
