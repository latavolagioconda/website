'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { eliminaEvento } from '@/app/(dashboard)/eventi/actions'
import { Button } from '@/components/ui/button'

interface EliminaEventoButtonProps {
  eventoId: string
}

export function EliminaEventoButton({ eventoId }: EliminaEventoButtonProps) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm("Eliminare questo evento? L'operazione non è reversibile."))
      return

    startTransition(async () => {
      const risultato = await eliminaEvento(eventoId)
      if (risultato?.errore) {
        toast.error(risultato.errore)
      } else {
        toast.success('Evento eliminato.')
      }
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={pending}
      className="text-destructive hover:text-destructive"
    >
      {pending ? '...' : 'Elimina'}
    </Button>
  )
}
