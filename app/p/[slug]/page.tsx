import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { Mail, Phone, Calendar, Gamepad2 } from 'lucide-react'
import { gravatarUrl } from '@/lib/gravatar'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('vista_profili_pubblici')
    .select('nickname, nome, cognome')
    .eq('slug', slug)
    .single()

  if (!data) return { title: 'Profilo non trovato — La Tavola Gioconda' }

  const nomeVisualizzato = data.nickname || `${data.nome ?? ''} ${data.cognome ?? ''}`.trim()
  return { title: `${nomeVisualizzato} — La Tavola Gioconda` }
}

export default async function ProfiloPubblicoPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: profilo } = await supabase
    .from('vista_profili_pubblici')
    .select('*')
    .eq('slug', slug)
    .single()

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

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <header className="border-b bg-background py-3 px-4">
        <div className="mx-auto max-w-lg">
          <Link href="/" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            La Tavola Gioconda
          </Link>
        </div>
      </header>

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

      <footer className="py-4 text-center text-xs text-muted-foreground border-t bg-background">
        <Link href="/" className="hover:underline">La Tavola Gioconda</Link>
      </footer>
    </div>
  )
}
