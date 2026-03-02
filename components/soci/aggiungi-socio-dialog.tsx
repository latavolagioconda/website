'use client'

import { useActionState, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { aggiungiSocio, type StatoSocio } from '@/app/(dashboard)/soci/actions'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function AggiungiSocioDialog() {
  const [aperto, setAperto] = useState(false)
  const [stato, azione, caricamento] = useActionState<StatoSocio, FormData>(
    aggiungiSocio,
    null
  )

  useEffect(() => {
    if (stato?.successo) {
      toast.success('Socio aggiunto con successo.')
      setAperto(false)
    }
    if (stato?.errore) {
      toast.error(stato.errore)
    }
  }, [stato])

  return (
    <Dialog open={aperto} onOpenChange={setAperto}>
      <DialogTrigger asChild>
        <Button>Aggiungi socio</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuovo socio</DialogTitle>
          <DialogDescription>
            Crea un account per il nuovo socio. Riceverà un&apos;email per
            impostare la password.
          </DialogDescription>
        </DialogHeader>
        <form action={azione} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" name="nome" required placeholder="Mario" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cognome">Cognome</Label>
              <Input
                id="cognome"
                name="cognome"
                required
                placeholder="Rossi"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="mario.rossi@esempio.it"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ruolo">Ruolo</Label>
            <Select name="ruolo" defaultValue="socio">
              <SelectTrigger id="ruolo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="socio">Socio</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
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
              {caricamento ? 'Creazione...' : 'Crea socio'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
