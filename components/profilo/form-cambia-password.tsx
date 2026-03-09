'use client'

import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'
import { cambiaPassword, type StatoProfilo } from '@/app/(dashboard)/profilo/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function FormCambiaPassword() {
  const [stato, azione, caricamento] = useActionState<StatoProfilo, FormData>(
    cambiaPassword,
    null
  )

  useEffect(() => {
    if (stato?.successo) toast.success('Password aggiornata.')
    if (stato?.errore) toast.error(stato.errore)
  }, [stato])

  return (
    <form action={azione} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nuova_password">Nuova password</Label>
        <Input
          id="nuova_password"
          name="nuova_password"
          type="password"
          required
          minLength={8}
          placeholder="Minimo 8 caratteri"
          autoComplete="new-password"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="conferma_password">Conferma password</Label>
        <Input
          id="conferma_password"
          name="conferma_password"
          type="password"
          required
          minLength={8}
          placeholder="Ripeti la nuova password"
          autoComplete="new-password"
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={caricamento}>
          {caricamento ? 'Aggiornamento...' : 'Aggiorna password'}
        </Button>
      </div>
    </form>
  )
}
