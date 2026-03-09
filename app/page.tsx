import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { CalendarioPubblico } from '@/components/homepage/calendario-pubblico'
import { createClient } from '@/lib/supabase/server'
import { gravatarUrl } from '@/lib/gravatar'

export const metadata: Metadata = {
  title: 'La Tavola Gioconda — Associazione Ludica',
  description: 'Associazione ludica di Rivalta di Torino, attiva dal 2009. Serate di gioco, tornei e molto altro.',
}

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: { user } }, { data: eventi }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('eventi')
      .select('id, titolo, descrizione, tipo, data_inizio, data_fine, luogo')
      .eq('pubblico', true)
      .gte('data_inizio', new Date().toISOString())
      .order('data_inizio', { ascending: true })
      .limit(9),
  ])

  let socio = null
  if (user) {
    const { data } = await supabase
      .from('soci')
      .select('nome, cognome, ruolo, nickname, avatar_url, email')
      .eq('auth_user_id', user.id)
      .single()
    socio = data
  }

  const tickerBase =
    '🎲 Associazione Ludica dal 2009 \u00a0\u00a0✦\u00a0\u00a0 ' +
    'Rivalta di Torino (TO) \u00a0\u00a0✦\u00a0\u00a0 ' 
  const tickerContent = tickerBase.repeat(6)

  const marqueeBase =
    'Giochi da tavolo \u00a0\u00a0✦\u00a0\u00a0 Giochi di ruolo \u00a0\u00a0✦\u00a0\u00a0 Wargame \u00a0\u00a0✦\u00a0\u00a0 Card Games \u00a0\u00a0✦\u00a0\u00a0 Tornei \u00a0\u00a0✦\u00a0\u00a0 Serate di gioco \u00a0\u00a0✦\u00a0\u00a0 '
  const marqueeContent = marqueeBase.repeat(6)

  return (
    <div className="min-h-screen bg-background">
      {/* Noise overlay */}
      <div className="noise-overlay fixed inset-0 pointer-events-none z-50" />

      {/* Ticker }
      <div className="bg-foreground text-background overflow-hidden py-2.5">
        <div className="ticker-scroll inline-block whitespace-nowrap text-xs tracking-[0.08em]">
          {tickerContent}
        </div>
      </div>*/}

      {/* Navbar */}
      <Navbar
        socio={socio ? {
          nome: socio.nome,
          cognome: socio.cognome,
          ruolo: socio.ruolo,
          nickname: socio.nickname,
          avatarSrc: socio.avatar_url || gravatarUrl(socio.email),
        } : null}
      />

      {/* Hero — split grid */}
      <section className="grid sm:grid-cols-2 border-b-2 border-foreground" style={{ minHeight: '88vh' }}>
        {/* Left: text */}
        <div className="flex flex-col justify-center px-8 py-16 sm:px-16 border-b-2 sm:border-b-0 sm:border-r-2 border-foreground">
          <p className="text-xs tracking-[0.15em] uppercase text-primary mb-6">
            // Associazione Ludica · Rivalta di Torino
          </p>
          <h1
            className="font-black leading-[1] tracking-[-0.03em]"
            style={{ fontSize: 'clamp(3rem, 5.5vw, 5.5rem)' }}
          >
            C&apos;è sempre<br />
            <em className="font-light text-primary">un posto</em><br />
            al tavolo
          </h1>
          <p
            className="mt-7 font-light leading-relaxed max-w-md opacity-75"
            style={{ fontSize: '1.15rem', lineHeight: '1.65' }}
          >
            A Rivalta di Torino dadi, carte e meeples
            diventano ponti tra persone. Entra nella nostra comunità: tornei,
            serate di gioco e molto altro.
          </p>
          <div className="mt-11">
            <a
              href="#agenda"
              className="btn-editorial inline-block bg-primary text-primary-foreground px-9 py-4 text-sm tracking-[0.06em] uppercase"
            >
              Scopri gli eventi
            </a>
          </div>
        </div>

        {/* Right: dark panel with D20 */}
        <div className="relative bg-foreground flex items-center justify-center min-h-[340px] sm:min-h-0">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(oklch(0.93 0.013 80) 1px, transparent 1px), linear-gradient(90deg, oklch(0.93 0.013 80) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <img
            src="/logo.svg"
            alt="La Tavola Gioconda"
            className="float-dice relative z-10 w-80 h-80 object-contain"
          />
        </div>
      </section>

      {/* Marquee divider */}
      <div className="bg-primary overflow-hidden py-3.5 border-t-2 border-b-2 border-foreground">
        <div
          className="marquee-scroll inline-block whitespace-nowrap text-primary-foreground text-xl italic"
          
        >
          {marqueeContent}
        </div>
      </div>

      {/* Chi siamo — split grid */}
      <section className="grid sm:grid-cols-2 border-b-2 border-foreground">
        {/* Left: decorative */}
        <div className="relative min-h-[380px] flex items-center justify-center border-b-2 sm:border-b-0 sm:border-r-2 border-foreground overflow-hidden" style={{ background: '#5C7A5A' }}>
          <span className="spin-slow block select-none" style={{ fontSize: '7rem' }}>🎲</span>
          <div className="absolute bottom-5 left-6 text-xs tracking-[0.12em] uppercase text-white/40">
            Est. 2009
          </div>
        </div>

        {/* Right: content */}
        <div className="flex flex-col justify-center px-8 py-14 sm:px-16">
          <p className="text-xs tracking-[0.2em] uppercase mb-5" style={{ color: '#3A6B8A' }}>
            // Chi siamo
          </p>
          <h2
            className="font-bold leading-[1.15] tracking-[-0.02em] mb-5"
            style={{ fontSize: 'clamp(2rem, 3.2vw, 3rem)' }}
          >
            Il cuore ludico <em className="text-primary">di Rivalta</em>
          </h2>
          <p className="font-light leading-[1.75] opacity-80 mb-4 max-w-lg" style={{ fontSize: '1.05rem' }}>
            La Tavola Gioconda è un&apos;associazione nata e cresciuta a Rivalta di Torino. La nostra missione è
            portare il gioco al centro della vita sociale del paese.
          </p>
          <p className="font-light leading-[1.75] opacity-80 max-w-lg" style={{ fontSize: '1.05rem' }}>
            Dai classici da tavolo ai giochi di ruolo, dalle serate libere ai tornei
            organizzati — una comunità aperta a tutti, dal neofita al veterano.
          </p>
          <div className="mt-8 pt-8 border-t-2 border-foreground grid grid-cols-2 gap-6">
            <div>
              <div className="text-[0.65rem] tracking-[0.15em] uppercase text-muted-foreground mb-2">Dove</div>
              <address className="font-light text-sm leading-relaxed not-italic opacity-80">
                Centro Giovani Comunale<br />
                Via Balegno 8<br />
                Rivalta di Torino (TO)
              </address>
            </div>
            <div>
              <div className="text-[0.65rem] tracking-[0.15em] uppercase text-muted-foreground mb-2">Orari</div>
              <p className="font-light text-sm leading-relaxed opacity-80">
                {/* TODO: aggiorna con gli orari reali */}
                Due Venerdì al mese: 20:00 – 00:00<br />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Events */}
      <section id="agenda" className="py-16 sm:py-20 px-6 sm:px-16 border-b-2 border-foreground">
        <div className="mb-10 sm:mb-12">
          <p className="text-[0.7rem] tracking-[0.2em] uppercase mb-4" style={{ color: '#3A6B8A' }}>
            // Prossimi appuntamenti
          </p>
          <h2
            className="font-bold leading-[1.15] tracking-[-0.02em]"
            style={{ fontSize: 'clamp(2rem, 3.2vw, 3rem)' }}
          >
            In <em className="text-primary">agenda</em>
          </h2>
        </div>
        <CalendarioPubblico eventi={eventi ?? []} />
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background">
        <div className="grid sm:grid-cols-2 gap-10 px-8 py-14 sm:px-16">
          <div>
            <img src="/logotipo-arancio.svg" alt="La Tavola Gioconda" className="h-10 w-auto mb-4" />
            <p className="font-light text-sm leading-relaxed max-w-xs" style={{ opacity: 0.55 }}>
              Associazione ludica di Rivalta di Torino.
            </p>
          </div>
          <div>
            <h4 className="text-[0.7rem] tracking-[0.15em] uppercase mb-5" style={{ color: '#D4A017' }}>
              Dove siamo
            </h4>
            <ul className="font-light text-sm space-y-2.5" style={{ opacity: 0.6 }}>
              <li>Centro Giovani Comunale</li>
              <li>Via Balegno 8</li>
              <li>10040 Rivalta di Torino (TO)</li>
            </ul>
          </div>
        </div>
        <div
          className="flex flex-col sm:flex-row justify-between items-center gap-2 px-8 sm:px-16 py-5 text-[0.7rem] tracking-[0.08em]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}
        >
          <span>© {new Date().getFullYear()} La Tavola Gioconda</span>
          <div className="flex items-center gap-3">
            <span>Rivalta di Torino</span>
            <img
              src="/stemma-rivalta.png"
              alt="Stemma di Rivalta di Torino"
              className="h-10 w-auto opacity-80"
            />
          </div>
        </div>
      </footer>
    </div>
  )
}
