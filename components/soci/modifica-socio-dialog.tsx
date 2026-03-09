'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { aggiornaBadgeSocio } from '@/app/(dashboard)/soci/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Pencil, X, Plus, Award } from 'lucide-react'

const BADGE_SUGGERITI = [
  'Fondatore',
  'Direttivo',
  'Presidente',
  'Vice Presidente',
  'Tesoriere',
  'Segretario',
  'Campione',
  'Veterano',
]

interface ModificaSocioDialogProps {
  socioId: string
  nome: string
  cognome: string
  badgeIniziali: string[]
}

export function ModificaSocioDialog({
  socioId,
  nome,
  cognome,
  badgeIniziali,
}: ModificaSocioDialogProps) {
  const router = useRouter()
  const [aperto, setAperto] = useState(false)
  const [pending, startTransition] = useTransition()
  const [badge, setBadge] = useState<string[]>(badgeIniziali)
  const [nuovoBadge, setNuovoBadge] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function aggiungiBadge(testo: string) {
    const pulito = testo.trim()
    if (!pulito || badge.includes(pulito)) return
    setBadge((prev) => [...prev, pulito])
    setNuovoBadge('')
    inputRef.current?.focus()
  }

  function rimuoviBadge(indice: number) {
    setBadge((prev) => prev.filter((_, i) => i !== indice))
  }

  function salva() {
    startTransition(async () => {
      const risultato = await aggiornaBadgeSocio(socioId, badge)
      if (risultato?.errore) {
        toast.error(risultato.errore)
        return
      }
      toast.success('Badge aggiornati.')
      router.refresh()
      setAperto(false)
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      aggiungiBadge(nuovoBadge)
    }
  }

  // Suggerimenti non ancora assegnati al socio
  const suggerimentiDisponibili = BADGE_SUGGERITI.filter((s) => !badge.includes(s))

  return (
    <Dialog open={aperto} onOpenChange={setAperto}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Modifica socio">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifica socio</DialogTitle>
          <DialogDescription>
            {nome} {cognome} — gestione badge
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Badge assegnati */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Award className="h-4 w-4 text-muted-foreground" />
              Badge assegnati
            </div>
            {badge.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nessun badge assegnato.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {badge.map((b, i) => (
                  <Badge
                    key={b}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                  >
                    {b}
                    <button
                      type="button"
                      onClick={() => rimuoviBadge(i)}
                      className="ml-0.5 rounded-sm opacity-60 hover:opacity-100 transition-opacity"
                      aria-label={`Rimuovi badge ${b}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Aggiungi badge */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Aggiungi badge</p>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={nuovoBadge}
                onChange={(e) => setNuovoBadge(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="es. Fondatore"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => aggiungiBadge(nuovoBadge)}
                disabled={!nuovoBadge.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Suggerimenti rapidi */}
            {suggerimentiDisponibili.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {suggerimentiDisponibili.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => aggiungiBadge(s)}
                    className="text-xs rounded-full border px-2.5 py-0.5 text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => setAperto(false)} disabled={pending}>
            Annulla
          </Button>
          <Button onClick={salva} disabled={pending}>
            {pending ? 'Salvataggio…' : 'Salva'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
