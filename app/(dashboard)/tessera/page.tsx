import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TesseraCard } from '@/components/tessera/tessera-card'
import { gravatarUrl } from '@/lib/gravatar'

export const metadata: Metadata = {
  title: 'La mia tessera — La Tavola Gioconda',
}

export default async function TesseraPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/area-riservata')

  const { data: socio } = await supabase
    .from('soci')
    .select(
      'nome, cognome, nickname, email, data_iscrizione, avatar_url, numero_tessera, scadenza_tessera, attivo, badge'
    )
    .eq('auth_user_id', user.id)
    .single()

  if (!socio) redirect('/area-riservata')

  const iniziali = `${socio.nome[0]}${socio.cognome[0]}`.toUpperCase()
  const avatarSrc = socio.avatar_url || gravatarUrl(socio.email)

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-8 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-bold mb-6 text-center">La tua tessera</h1>

        <TesseraCard
          nome={socio.nome}
          cognome={socio.cognome}
          nickname={socio.nickname}
          avatarSrc={avatarSrc}
          iniziali={iniziali}
          numeroTessera={socio.numero_tessera}
          scadenzaTessera={socio.scadenza_tessera}
          dataIscrizione={socio.data_iscrizione}
          attivo={socio.attivo}
          badge={socio.badge}
        />

        {!socio.numero_tessera && (
          <p className="text-center text-sm text-muted-foreground mt-5">
            Il numero tessera non è ancora stato assegnato.
            <br />
            Contatta un amministratore.
          </p>
        )}

        {!socio.attivo && (
          <p className="text-center text-sm text-destructive mt-5 font-medium">
            La tua tessera è sospesa. Contatta un amministratore.
          </p>
        )}
      </div>
    </div>
  )
}
