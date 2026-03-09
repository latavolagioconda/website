import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Mail, Phone, Calendar, Gamepad2, ExternalLink, Award } from 'lucide-react'
import { gravatarUrl } from '@/lib/gravatar'
import { Navbar } from '@/components/navbar'
import type { VistaProfiliPubblici } from '@/types/database'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = (await (supabase as any)
    .from('vista_profili_pubblici')
    .select('nickname, nome, cognome')
    .eq('slug', slug)
    .single()) as { data: Pick<VistaProfiliPubblici, 'nickname' | 'nome' | 'cognome'> | null }

  if (!data) return { title: 'Profilo non trovato — La Tavola Gioconda' }

  const nomeVisualizzato = data.nickname || `${data.nome ?? ''} ${data.cognome ?? ''}`.trim()
  return { title: `${nomeVisualizzato} — La Tavola Gioconda` }
}

export default async function ProfiloPubblicoPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profilo } = (await (supabase as any)
    .from('vista_profili_pubblici')
    .select('*')
    .eq('slug', slug)
    .single()) as { data: VistaProfiliPubblici | null }

  if (!profilo) notFound()

  // Il nickname è il nome primario; nome completo solo se il socio lo ha reso pubblico
  const nomeVisualizzato = profilo.nickname || `${profilo.nome ?? ''} ${profilo.cognome ?? ''}`.trim()
  const hasPrimaLettera = nomeVisualizzato.length > 0
  const iniziali = hasPrimaLettera ? nomeVisualizzato.substring(0, 2).toUpperCase() : '?'

  const dataIscrizione = new Date(profilo.data_iscrizione).toLocaleDateString('it-IT', {
    month: 'long',
    year: 'numeric',
  })

  const haContatti = profilo.email || profilo.telefono || profilo.data_nascita
  const social = [
    profilo.social_x        && { label: 'X',         url: `https://x.com/${profilo.social_x}`,                         handle: `@${profilo.social_x}` },
    profilo.social_instagram && { label: 'Instagram', url: `https://instagram.com/${profilo.social_instagram}`,          handle: `@${profilo.social_instagram}` },
    profilo.social_bluesky  && { label: 'Bluesky',   url: `https://bsky.app/profile/${profilo.social_bluesky}`,         handle: profilo.social_bluesky },
    profilo.social_facebook && { label: 'Facebook',  url: `https://facebook.com/${profilo.social_facebook}`,            handle: profilo.social_facebook },
    profilo.social_discord  && { label: 'Discord',   url: null,                                                           handle: profilo.social_discord },
    profilo.social_steam    && { label: 'Steam',     url: `https://steamcommunity.com/id/${profilo.social_steam}`,        handle: profilo.social_steam },
  ].filter(Boolean) as { label: string; url: string | null; handle: string }[]

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Navbar socio={null} />

      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-lg space-y-6">

          {/* Avatar e nome */}
          <div className="flex flex-col items-center text-center gap-3">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={profilo.avatar_url || (profilo.email ? gravatarUrl(profilo.email) : undefined)}
                alt={nomeVisualizzato}
              />
              <AvatarFallback className="text-3xl">{iniziali}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{nomeVisualizzato}</h1>
              {/* Nome completo visibile solo se il socio lo ha abilitato */}
              {profilo.nickname && (profilo.nome || profilo.cognome) && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {profilo.nome} {profilo.cognome}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-1">Socio dal {dataIscrizione}</p>
            </div>
          </div>

          {/* Badge */}
          {profilo.badge && profilo.badge.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {profilo.badge.map((b) => (
                <Badge key={b} variant="outline" className="gap-1 px-3 py-1 text-sm">
                  <Award className="h-3.5 w-3.5" />
                  {b}
                </Badge>
              ))}
            </div>
          )}

          {/* Bio */}
          {profilo.bio && (
            <Card>
              <CardContent className="pt-5">
                <p className="text-sm leading-relaxed">{profilo.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Giochi preferiti */}
          {profilo.giochi_preferiti && profilo.giochi_preferiti.length > 0 && (
            <Card>
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Gamepad2 className="h-4 w-4 text-muted-foreground" />
                  Giochi preferiti
                </div>
                <div className="flex flex-wrap gap-2">
                  {profilo.giochi_preferiti.map((gioco) => (
                    <Badge key={gioco} variant="secondary">{gioco}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Social */}
          {social.length > 0 && (
            <Card>
              <CardContent className="pt-5 space-y-3">
                {social.map((s, i) => (
                  <div key={s.label}>
                    {i > 0 && <Separator />}
                    {s.url ? (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-3 text-sm hover:text-primary transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-muted-foreground w-16 shrink-0">{s.label}</span>
                          <span>{s.handle}</span>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-xs font-medium text-muted-foreground w-16 shrink-0">{s.label}</span>
                        <span>{s.handle}</span>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Contatti */}
          {haContatti && (
            <Card>
              <CardContent className="pt-5 space-y-3">
                {profilo.email && (
                  <a
                    href={`mailto:${profilo.email}`}
                    className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                  >
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    {profilo.email}
                  </a>
                )}
                {profilo.telefono && (
                  <>
                    {profilo.email && <Separator />}
                    <a
                      href={`tel:${profilo.telefono}`}
                      className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                    >
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      {profilo.telefono}
                    </a>
                  </>
                )}
                {profilo.data_nascita && (
                  <>
                    {(profilo.email || profilo.telefono) && <Separator />}
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      {new Date(profilo.data_nascita).toLocaleDateString('it-IT', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <footer className="bg-foreground text-background">
        <div className="grid sm:grid-cols-2 gap-10 px-8 py-14 sm:px-16">
          <div>
            <img src="/logotipo-arancio.svg" alt="La Tavola Gioconda" className="h-10 w-auto mb-4" />
            <p className="font-light text-sm leading-relaxed max-w-xs" style={{ opacity: 0.55 }}>
              Associazione ludica di Rivalta di Torino. Siamo al Centro Giovani Comunale di Via Balegno 8.
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
