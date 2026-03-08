'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { gestisciProfiloPubblico } from '@/app/(dashboard)/soci/actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Globe, Copy, RefreshCw, Link2Off } from 'lucide-react'

interface GestisciProfiloDialogProps {
  socioId: string
  nome: string
  cognome: string
  profilo: { slug: string; abilitato: boolean } | null
}

export function GestisciProfiloDialog({
  socioId,
  nome,
  cognome,
  profilo: profiloIniziale,
}: GestisciProfiloDialogProps) {
  // nome e cognome usati solo per visualizzazione nel dialog, non per generare lo slug
  const router = useRouter()
  const [aperto, setAperto] = useState(false)
  const [pending, startTransition] = useTransition()
  // Stato locale per aggiornare il dialog immediatamente senza attendere il re-render del server
  const [profilo, setProfilo] = useState(profiloIniziale)

  const urlBase = typeof window !== 'undefined' ? window.location.origin : ''
  const urlPubblico = profilo ? `${urlBase}/p/${profilo.slug}` : null

  function esegui(azione: 'genera' | 'rigenera' | 'toggle') {
    startTransition(async () => {
      const risultato = await gestisciProfiloPubblico(
        socioId,
        azione,
        profilo?.abilitato
      )

      if (risultato?.errore) {
        toast.error(risultato.errore)
        return
      }

      // Aggiorna lo stato locale immediatamente
      if (azione === 'genera' || azione === 'rigenera') {
        if (risultato?.slug) {
          setProfilo({ slug: risultato.slug, abilitato: true })
        }
        toast.success(azione === 'genera' ? 'Link pubblico generato.' : 'Link rigenerato con successo.')
      } else if (azione === 'toggle' && profilo) {
        setProfilo({ ...profilo, abilitato: !profilo.abilitato })
        toast.success(profilo.abilitato ? 'Profilo pubblico disabilitato.' : 'Profilo pubblico abilitato.')
      }

      // Aggiorna i dati del server in background (per la prossima apertura del dialog)
      router.refresh()
    })
  }

  async function copiaLink() {
    if (!urlPubblico) return
    try {
      await navigator.clipboard.writeText(urlPubblico)
      toast.success('Link copiato negli appunti.')
    } catch {
      // Fallback per browser che non supportano clipboard API (HTTP, permessi negati)
      const el = document.createElement('textarea')
      el.value = urlPubblico
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.focus()
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      toast.success('Link copiato negli appunti.')
    }
  }

  return (
    <Dialog open={aperto} onOpenChange={setAperto}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Gestisci profilo pubblico">
          <Globe className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profilo pubblico</DialogTitle>
          <DialogDescription>
            {nome} {cognome} — link per tessera NFC
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {!profilo ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Nessun profilo pubblico generato per questo socio.
              </p>
              <Button onClick={() => esegui('genera')} disabled={pending} className="w-full">
                <Globe className="mr-2 h-4 w-4" />
                {pending ? 'Generazione...' : 'Genera link pubblico'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Badge variant={profilo.abilitato ? 'default' : 'secondary'}>
                {profilo.abilitato ? 'Attivo' : 'Disabilitato'}
              </Badge>

              {/* URL */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">URL profilo</p>
                <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2">
                  <code className="flex-1 text-xs break-all">{urlPubblico}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={copiaLink}
                    title="Copia link"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Usa questo URL per programmare il tag NFC sulla tessera.
                </p>
              </div>

              {/* Azioni */}
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={() => esegui('toggle')}
                  disabled={pending}
                >
                  <Link2Off className="mr-2 h-4 w-4" />
                  {profilo.abilitato ? 'Disabilita profilo pubblico' : 'Abilita profilo pubblico'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => esegui('rigenera')}
                  disabled={pending}
                  className="text-muted-foreground"
                >
                  <RefreshCw className="mr-2 h-3.5 w-3.5" />
                  Rigenera link (cambia URL)
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
