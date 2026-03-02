'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { toggleAttivoSocio } from '@/app/(dashboard)/soci/actions'
import { Button } from '@/components/ui/button'

interface ToggleAttivoButtonProps {
  socioId: string
  attivo: boolean
}

export function ToggleAttivoButton({ socioId, attivo }: ToggleAttivoButtonProps) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const risultato = await toggleAttivoSocio(socioId, attivo)
      if (risultato?.errore) {
        toast.error(risultato.errore)
      } else {
        toast.success(attivo ? 'Socio disattivato.' : 'Socio riattivato.')
      }
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={pending}
      className={
        attivo
          ? 'text-destructive hover:text-destructive'
          : 'text-muted-foreground'
      }
    >
      {pending ? '...' : attivo ? 'Disattiva' : 'Riattiva'}
    </Button>
  )
}
