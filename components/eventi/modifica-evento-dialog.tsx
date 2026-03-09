'use client'

import { useActionState, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { modificaEvento, type StatoEvento } from '@/app/(dashboard)/eventi/actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Evento = {
  id: string
  titolo: string
  descrizione: string | null
  tipo: string
  data_inizio: string
  data_fine: string | null
  luogo: string | null
  pubblico: boolean
}

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return ''
  // Prende i primi 16 caratteri (YYYY-MM-DDTHH:mm) per datetime-local
  return new Date(iso).toISOString().slice(0, 16)
}

export function ModificaEventoDialog({ evento }: { evento: Evento }) {
  const [aperto, setAperto] = useState(false)
  const [stato, azione, caricamento] = useActionState<StatoEvento, FormData>(
    modificaEvento,
    null
  )

  useEffect(() => {
    if (stato?.successo) {
      toast.success('Evento modificato con successo.')
      setAperto(false)
    }
    if (stato?.errore) {
      toast.error(stato.errore)
    }
  }, [stato])

  return (
    <Dialog open={aperto} onOpenChange={setAperto}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Modifica</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifica evento</DialogTitle>
          <DialogDescription>
            Aggiorna i dettagli dell&apos;evento.
          </DialogDescription>
        </DialogHeader>
        <form action={azione} className="space-y-4 pt-2">
          <input type="hidden" name="id" value={evento.id} />
          <div className="space-y-2">
            <Label htmlFor="titolo">Titolo</Label>
            <Input
              id="titolo"
              name="titolo"
              required
              defaultValue={evento.titolo}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descrizione">Descrizione</Label>
            <Textarea
              id="descrizione"
              name="descrizione"
              rows={3}
              defaultValue={evento.descrizione ?? ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <Select name="tipo" defaultValue={evento.tipo}>
              <SelectTrigger id="tipo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="evento">Evento</SelectItem>
                <SelectItem value="torneo">Torneo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_inizio">Data inizio</Label>
              <Input
                id="data_inizio"
                name="data_inizio"
                type="datetime-local"
                required
                defaultValue={toDatetimeLocal(evento.data_inizio)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_fine">Data fine</Label>
              <Input
                id="data_fine"
                name="data_fine"
                type="datetime-local"
                defaultValue={toDatetimeLocal(evento.data_fine)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="luogo">Luogo</Label>
            <Input
              id="luogo"
              name="luogo"
              placeholder="Via Roma 1, Milano"
              defaultValue={evento.luogo ?? ''}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="pubblico"
              name="pubblico"
              type="checkbox"
              defaultChecked={evento.pubblico}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <Label htmlFor="pubblico" className="font-normal cursor-pointer">
              Visibile sulla homepage pubblica
            </Label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAperto(false)}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={caricamento}>
              {caricamento ? 'Salvataggio...' : 'Salva modifiche'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
