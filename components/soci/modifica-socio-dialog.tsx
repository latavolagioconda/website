'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { aggiornaSocio, resetPasswordSocio } from '@/app/(dashboard)/soci/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Pencil, X, Plus, Award, KeyRound } from 'lucide-react'

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
  email: string
  ruolo: string
  dataIscrizione: string
  badgeIniziali: string[]
}

export function ModificaSocioDialog({
  socioId,
  nome,
  cognome,
  email,
  ruolo,
  dataIscrizione,
  badgeIniziali,
}: ModificaSocioDialogProps) {
  const router = useRouter()
  const [aperto, setAperto] = useState(false)
  const [pending, startTransition] = useTransition()

  const [campi, setCampi] = useState({ nome, cognome, email, ruolo, dataIscrizione })
  const [badge, setBadge] = useState<string[]>(badgeIniziali)
  const [nuovoBadge, setNuovoBadge] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [nuovaPassword, setNuovaPassword] = useState('')
  const [pendingPassword, startTransitionPassword] = useTransition()

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

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      aggiungiBadge(nuovoBadge)
    }
  }

  function salva() {
    if (!campi.nome.trim() || !campi.cognome.trim() || !campi.email.trim()) {
      toast.error('Nome, cognome ed email sono obbligatori.')
      return
    }
    startTransition(async () => {
      const risultato = await aggiornaSocio(socioId, {
        nome: campi.nome.trim(),
        cognome: campi.cognome.trim(),
        email: campi.email.trim(),
        ruolo: campi.ruolo,
        data_iscrizione: campi.dataIscrizione,
        badge,
      })
      if (risultato?.errore) {
        toast.error(risultato.errore)
        return
      }
      toast.success('Socio aggiornato.')
      router.refresh()
      setAperto(false)
    })
  }

  function reimpostaPassword() {
    if (!nuovaPassword || nuovaPassword.length < 8) {
      toast.error('La password deve essere di almeno 8 caratteri.')
      return
    }
    startTransitionPassword(async () => {
      const risultato = await resetPasswordSocio(socioId, nuovaPassword)
      if (risultato?.errore) {
        toast.error(risultato.errore)
        return
      }
      toast.success('Password aggiornata.')
      setNuovaPassword('')
    })
  }

  // Reimposta i valori all'apertura del dialog
  function handleOpenChange(open: boolean) {
    if (open) {
      setCampi({ nome, cognome, email, ruolo, dataIscrizione })
      setBadge(badgeIniziali)
      setNuovoBadge('')
      setNuovaPassword('')
    }
    setAperto(open)
  }

  const suggerimentiDisponibili = BADGE_SUGGERITI.filter((s) => !badge.includes(s))

  return (
    <Dialog open={aperto} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Modifica socio">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifica socio</DialogTitle>
          <DialogDescription>
            {nome} {cognome}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Anagrafica */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="mod-nome">Nome</Label>
              <Input
                id="mod-nome"
                value={campi.nome}
                onChange={(e) => setCampi((p) => ({ ...p, nome: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mod-cognome">Cognome</Label>
              <Input
                id="mod-cognome"
                value={campi.cognome}
                onChange={(e) => setCampi((p) => ({ ...p, cognome: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mod-email">Email</Label>
            <Input
              id="mod-email"
              type="email"
              value={campi.email}
              onChange={(e) => setCampi((p) => ({ ...p, email: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Ruolo</Label>
              <Select
                value={campi.ruolo}
                onValueChange={(v) => setCampi((p) => ({ ...p, ruolo: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="socio">Socio</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mod-data">Iscritto il</Label>
              <Input
                id="mod-data"
                type="date"
                value={campi.dataIscrizione}
                onChange={(e) => setCampi((p) => ({ ...p, dataIscrizione: e.target.value }))}
              />
            </div>
          </div>

          <Separator />

          {/* Badge assegnati */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Award className="h-4 w-4 text-muted-foreground" />
              Badge
            </div>
            {badge.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nessun badge assegnato.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {badge.map((b, i) => (
                  <Badge key={b} variant="secondary" className="flex items-center gap-1 pr-1">
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

          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={nuovoBadge}
                onChange={(e) => setNuovoBadge(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Aggiungi badge…"
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

            {suggerimentiDisponibili.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
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

          <Separator />

          {/* Reset password */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <KeyRound className="h-4 w-4 text-muted-foreground" />
              Reimposta password
            </div>
            <div className="flex gap-2">
              <Input
                type="password"
                value={nuovaPassword}
                onChange={(e) => setNuovaPassword(e.target.value)}
                placeholder="Nuova password (min. 8 caratteri)"
                autoComplete="new-password"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={reimpostaPassword}
                disabled={pendingPassword || !nuovaPassword}
              >
                {pendingPassword ? 'Salvataggio…' : 'Imposta'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Comunica la nuova password al socio. Potrà cambiarla dal proprio profilo.
            </p>
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
