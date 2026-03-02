'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { togglIscrizione } from '@/app/(dashboard)/eventi/actions'
import { Button } from '@/components/ui/button'

interface IscrizioneButtonProps {
  eventoId: string
  iscritto: boolean
  alCompleto: boolean
}

export function IscrizioneButton({
  eventoId,
  iscritto,
  alCompleto,
}: IscrizioneButtonProps) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const risultato = await togglIscrizione(eventoId, iscritto)
      if (risultato?.errore) {
        toast.error(risultato.errore)
      } else {
        toast.success(iscritto ? 'Iscrizione annullata.' : 'Iscritto con successo!')
      }
    })
  }

  return (
    <Button
      variant={iscritto ? 'outline' : 'default'}
      size="sm"
      onClick={handleClick}
      disabled={pending || alCompleto}
    >
      {pending ? '...' : iscritto ? 'Disiscrivi' : alCompleto ? 'Completo' : 'Iscriviti'}
    </Button>
  )
}
