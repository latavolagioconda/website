'use client'

import { useActionState, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { creaEvento, type StatoEvento } from '@/app/(dashboard)/eventi/actions'
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

export function AggiungiEventoDialog() {
  const [aperto, setAperto] = useState(false)
  const [stato, azione, caricamento] = useActionState<StatoEvento, FormData>(
    creaEvento,
    null
  )

  useEffect(() => {
    if (stato?.successo) {
      toast.success('Evento creato con successo.')
      setAperto(false)
    }
    if (stato?.errore) {
      toast.error(stato.errore)
    }
  }, [stato])

  return (
    <Dialog open={aperto} onOpenChange={setAperto}>
      <DialogTrigger asChild>
        <Button>Aggiungi evento</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuovo evento</DialogTitle>
          <DialogDescription>
            Crea un nuovo evento o torneo per i soci.
          </DialogDescription>
        </DialogHeader>
        <form action={azione} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="titolo">Titolo</Label>
            <Input
              id="titolo"
              name="titolo"
              required
              placeholder="Torneo di scacchi"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descrizione">Descrizione</Label>
            <Textarea
              id="descrizione"
              name="descrizione"
              placeholder="Dettagli sull'evento..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select name="tipo" defaultValue="evento">
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="evento">Evento</SelectItem>
                  <SelectItem value="torneo">Torneo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_partecipanti">Max partecipanti</Label>
              <Input
                id="max_partecipanti"
                name="max_partecipanti"
                type="number"
                min="1"
                placeholder="Nessun limite"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_inizio">Data inizio</Label>
              <Input
                id="data_inizio"
                name="data_inizio"
                type="datetime-local"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_fine">Data fine</Label>
              <Input id="data_fine" name="data_fine" type="datetime-local" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="luogo">Luogo</Label>
            <Input id="luogo" name="luogo" placeholder="Via Roma 1, Milano" />
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
              {caricamento ? 'Creazione...' : 'Crea evento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
