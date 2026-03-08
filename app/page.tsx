import type { Metadata } from 'next'
import { NavbarPubblica } from '@/components/homepage/navbar-pubblica'
import { Navbar } from '@/components/navbar'
import { CalendarioPubblico } from '@/components/homepage/calendario-pubblico'
import { createClient } from '@/lib/supabase/server'
import { gravatarUrl } from '@/lib/gravatar'
import { MapPin, Clock, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'La Tavola Gioconda — Associazione Ludica',
  description: 'Associazione ludica dedicata ai giochi da tavolo. Unisciti a noi per eventi, tornei e serate di gioco.',
}

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: { user } }, { data: eventi }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('eventi')
      .select('id, titolo, descrizione, tipo, data_inizio, data_fine, luogo, max_partecipanti')
      .eq('pubblico', true)
      .gte('data_inizio', new Date().toISOString())
      .order('data_inizio', { ascending: true })
      .limit(9),
  ])

  // Se autenticato, carica i dati del socio per la navbar completa
  let socio = null
  if (user) {
    const { data } = await supabase
      .from('soci')
      .select('nome, cognome, ruolo, nickname, avatar_url, email')
      .eq('auth_user_id', user.id)
      .single()
    socio = data
  }

  return (
    <div className="min-h-screen bg-background">
      {socio ? (
        <Navbar
          nome={socio.nome}
          cognome={socio.cognome}
          ruolo={socio.ruolo}
          nickname={socio.nickname}
          avatarSrc={socio.avatar_url || gravatarUrl(socio.email)}
        />
      ) : (
        <NavbarPubblica />
      )}

      {/* Hero */}
      <section className="relative overflow-hidden border-b py-28 px-4">
        {/* Pattern di sfondo */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, oklch(0.55 0.22 307 / 0.4) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        {/* Glow centrale */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="h-[500px] w-[700px] rounded-full blur-3xl opacity-20"
            style={{ background: 'radial-gradient(ellipse, oklch(0.55 0.22 307) 0%, transparent 70%)' }}
          />
        </div>
        {/* Fade verso il basso */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-background to-transparent" />

        <div className="relative mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-8 tracking-wide uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Rivalta di Torino · Dal 2009
          </div>

          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl"
            style={{
              background: 'linear-gradient(135deg, oklch(0.96 0.005 307) 0%, oklch(0.75 0.1 307) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            La Tavola Gioconda
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Ogni settimana ci ritroviamo per giocare, scoprire nuovi titoli e
            trascorrere serate in buona compagnia. Che tu abbia mai mosso un pedone
            o costruito città su Catan, qui c&apos;è un posto per te.
          </p>
        </div>
      </section>

      {/* Chi siamo + dove siamo */}
      <section className="py-20 px-4 border-b">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold">Dove ci trovi</h2>
            <p className="text-muted-foreground mt-2 text-sm">Tutto quello che ti serve per venire a giocare con noi</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {/* Card Dove siamo */}
            <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-4 transition-colors hover:border-primary/40 hover:bg-primary/5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Dove siamo</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Centro Giovani Comunale<br />
                  Via Balegno 8<br />
                  Rivalta di Torino (TO)
                </p>
              </div>
            </div>

            {/* Card Orari */}
            <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-4 transition-colors hover:border-primary/40 hover:bg-primary/5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Orari</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {/* TODO: inserisci gli orari reali */}
                  Venerdì: 20:00 – 23:30<br />
                  Sabato: 15:00 – 23:30
                </p>
              </div>
            </div>

            {/* Card Come partecipare */}
            <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-4 transition-colors hover:border-primary/40 hover:bg-primary/5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Come partecipare</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {/* TODO: aggiorna con le istruzioni reali */}
                  Contattaci per entrare a far parte dell&apos;associazione.
                  L&apos;iscrizione è aperta tutto l&apos;anno.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calendario eventi pubblici */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold">Prossimi eventi</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Tornei, serate di gioco e molto altro — aperti a tutti.
              </p>
            </div>
            <div className="h-px flex-1 bg-border hidden sm:block" />
          </div>
          <CalendarioPubblico eventi={eventi ?? []} />
        </div>
      </section>

      <footer className="border-t py-8 px-4">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/60">La Tavola Gioconda</span>
          <span>© {new Date().getFullYear()} — Tutti i diritti riservati</span>
        </div>
      </footer>
    </div>
  )
}
