'use client'

import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'
import { aggiornaProfilo, type StatoProfilo } from '@/app/(dashboard)/profilo/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Tables } from '@/types/database'

type Socio = Pick<
  Tables<'soci'>,
  | 'nome' | 'cognome' | 'nickname' | 'email'
  | 'bio' | 'telefono' | 'avatar_url' | 'data_nascita' | 'giochi_preferiti'
  | 'pubblica_nome_completo' | 'pubblica_bio' | 'pubblica_giochi'
  | 'pubblica_email' | 'pubblica_telefono' | 'pubblica_data_nascita'
>

function TogglePrivacy({
  name,
  defaultChecked,
}: {
  name: string
  defaultChecked: boolean
}) {
  return (
    <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-3.5 w-3.5 rounded border-input accent-primary"
      />
      Visibile nel profilo pubblico
    </label>
  )
}

function RigaConPrivacy({
  id,
  label,
  nomeFlag,
  flagAbilitato,
  children,
}: {
  id: string
  label: string
  nomeFlag: string
  flagAbilitato: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor={id}>{label}</Label>
        <TogglePrivacy name={nomeFlag} defaultChecked={flagAbilitato} />
      </div>
      {children}
    </div>
  )
}

export function FormProfilo({ socio }: { socio: Socio }) {
  const [stato, azione, caricamento] = useActionState<StatoProfilo, FormData>(
    aggiornaProfilo,
    null
  )

  useEffect(() => {
    if (stato?.successo) toast.success('Profilo aggiornato.')
    if (stato?.errore) toast.error(stato.errore)
  }, [stato])

  const giochiStr = socio.giochi_preferiti?.join(', ') ?? ''

  return (
    <form action={azione} className="space-y-8">

      {/* Nickname */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Identità
        </h2>
        <div className="space-y-2">
          <Label htmlFor="nickname">Nickname</Label>
          <Input
            id="nickname"
            name="nickname"
            defaultValue={socio.nickname ?? ''}
            placeholder="Il nome con cui ti conoscono al tavolo"
          />
          <p className="text-xs text-muted-foreground">
            Questo è il nome principale mostrato nel tuo profilo pubblico.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="avatar_url">URL immagine profilo</Label>
          <Input
            id="avatar_url"
            name="avatar_url"
            type="url"
            defaultValue={socio.avatar_url ?? ''}
            placeholder="https://esempio.com/mia-foto.jpg"
          />
        </div>
      </div>

      <Separator />

      {/* Informazioni personali con privacy */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Informazioni personali
        </h2>
        <p className="text-xs text-muted-foreground -mt-2">
          Scegli cosa rendere visibile nel profilo pubblico (link NFC sulla tessera).
        </p>

        {/* Nome completo */}
        <RigaConPrivacy
          id="nome-completo"
          label="Nome completo"
          nomeFlag="pubblica_nome_completo"
          flagAbilitato={socio.pubblica_nome_completo}
        >
          <div className="flex gap-2">
            <Input value={socio.nome} readOnly disabled className="bg-muted" />
            <Input value={socio.cognome} readOnly disabled className="bg-muted" />
          </div>
          <p className="text-xs text-muted-foreground">
            Nome e cognome non sono modificabili. Contatta un amministratore.
          </p>
        </RigaConPrivacy>

        {/* Bio */}
        <RigaConPrivacy
          id="bio"
          label="Presentazione"
          nomeFlag="pubblica_bio"
          flagAbilitato={socio.pubblica_bio}
        >
          <Textarea
            id="bio"
            name="bio"
            defaultValue={socio.bio ?? ''}
            placeholder="Raccontati ai tuoi compagni di gioco..."
            rows={4}
          />
        </RigaConPrivacy>

        {/* Giochi */}
        <RigaConPrivacy
          id="giochi_preferiti"
          label="Giochi preferiti"
          nomeFlag="pubblica_giochi"
          flagAbilitato={socio.pubblica_giochi}
        >
          <Input
            id="giochi_preferiti"
            name="giochi_preferiti"
            defaultValue={giochiStr}
            placeholder="Catan, Pandemic, Ticket to Ride"
          />
          <p className="text-xs text-muted-foreground">Separati da virgola.</p>
        </RigaConPrivacy>
      </div>

      <Separator />

      {/* Contatti */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Contatti
        </h2>

        <RigaConPrivacy
          id="email-display"
          label="Email"
          nomeFlag="pubblica_email"
          flagAbilitato={socio.pubblica_email}
        >
          <Input id="email-display" value={socio.email} readOnly disabled className="bg-muted" />
        </RigaConPrivacy>

        <RigaConPrivacy
          id="telefono"
          label="Telefono"
          nomeFlag="pubblica_telefono"
          flagAbilitato={socio.pubblica_telefono}
        >
          <Input
            id="telefono"
            name="telefono"
            type="tel"
            defaultValue={socio.telefono ?? ''}
            placeholder="+39 333 1234567"
          />
        </RigaConPrivacy>
      </div>

      <Separator />

      {/* Dati anagrafici */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Dati anagrafici
        </h2>

        <RigaConPrivacy
          id="data_nascita"
          label="Data di nascita"
          nomeFlag="pubblica_data_nascita"
          flagAbilitato={socio.pubblica_data_nascita}
        >
          <Input
            id="data_nascita"
            name="data_nascita"
            type="date"
            defaultValue={socio.data_nascita ?? ''}
          />
        </RigaConPrivacy>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={caricamento}>
          {caricamento ? 'Salvataggio...' : 'Salva modifiche'}
        </Button>
      </div>
    </form>
  )
}
