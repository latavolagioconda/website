import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FormProfilo } from '@/components/profilo/form-profilo'
import { gravatarUrl } from '@/lib/gravatar'

export const metadata: Metadata = {
  title: 'Il mio profilo — La Tavola Gioconda',
}

export default async function ProfiloPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/area-riservata')

  const { data: socio } = await supabase
    .from('soci')
    .select(
      'nome, cognome, nickname, email, ruolo, data_iscrizione, bio, telefono, avatar_url, data_nascita, giochi_preferiti, pubblica_nome_completo, pubblica_bio, pubblica_giochi, pubblica_email, pubblica_telefono, pubblica_data_nascita'
    )
    .eq('auth_user_id', user.id)
    .single()

  if (!socio) redirect('/area-riservata')

  const iniziali = `${socio.nome[0]}${socio.cognome[0]}`.toUpperCase()
  const nomeVisualizzato = socio.nickname || `${socio.nome} ${socio.cognome}`
  const avatarSrc = socio.avatar_url || gravatarUrl(socio.email)
  const dataIscrizione = new Date(socio.data_iscrizione).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-8">
      {/* Intestazione */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={avatarSrc} alt={nomeVisualizzato} />
          <AvatarFallback className="text-xl">{iniziali}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{nomeVisualizzato}</h1>
          {socio.nickname && (
            <p className="text-sm text-muted-foreground">
              {socio.nome} {socio.cognome}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={socio.ruolo === 'admin' ? 'default' : 'secondary'}>
              {socio.ruolo}
            </Badge>
            <span className="text-sm text-muted-foreground">Socio dal {dataIscrizione}</span>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-lg font-semibold mb-1">Modifica profilo</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Il nickname è il nome primario del tuo profilo. Scegli poi quali informazioni
          rendere visibili nel profilo pubblico (link NFC sulla tessera).
        </p>
        <FormProfilo socio={socio} />
      </div>
    </div>
  )
}
