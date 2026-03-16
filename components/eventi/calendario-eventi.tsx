'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ModificaEventoDialog } from './modifica-evento-dialog'
import { EliminaEventoButton } from './elimina-evento-button'
import { cn } from '@/lib/utils'

type Evento = {
  id: string
  titolo: string
  descrizione: string | null
  tipo: string
  data_inizio: string
  data_fine: string | null
  luogo: string | null
  pubblico: boolean
  max_partecipanti?: number | null
}

const GIORNI = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
const MESI = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
]

function primoGiornoSettimana(anno: number, mese: number): number {
  // Restituisce 0=Lun … 6=Dom (convenzione europea)
  return (new Date(anno, mese, 1).getDay() + 6) % 7
}

function giorniNelMese(anno: number, mese: number): number {
  return new Date(anno, mese + 1, 0).getDate()
}

function chiaveData(anno: number, mese: number, giorno: number): string {
  return `${anno}-${String(mese + 1).padStart(2, '0')}-${String(giorno).padStart(2, '0')}`
}

export function CalendarioEventi({
  eventi,
  isAdmin,
}: {
  eventi: Evento[]
  isAdmin: boolean
}) {
  const oggi = new Date()
  const oggiKey = chiaveData(oggi.getFullYear(), oggi.getMonth(), oggi.getDate())

  const [anno, setAnno] = useState(oggi.getFullYear())
  const [mese, setMese] = useState(oggi.getMonth())
  const [selezionato, setSelezionato] = useState<string | null>(null)

  const eventiPerGiorno = useMemo(() => {
    const map: Record<string, Evento[]> = {}
    for (const evento of eventi) {
      const d = new Date(evento.data_inizio)
      const key = chiaveData(d.getFullYear(), d.getMonth(), d.getDate())
      if (!map[key]) map[key] = []
      map[key].push(evento)
    }
    return map
  }, [eventi])

  const numGiorni = giorniNelMese(anno, mese)
  const offset = primoGiornoSettimana(anno, mese)
  const celle: (number | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: numGiorni }, (_, i) => i + 1),
  ]
  while (celle.length % 7 !== 0) celle.push(null)

  function mesePrecedente() {
    if (mese === 0) { setMese(11); setAnno(a => a - 1) }
    else setMese(m => m - 1)
    setSelezionato(null)
  }
  function meseSeguente() {
    if (mese === 11) { setMese(0); setAnno(a => a + 1) }
    else setMese(m => m + 1)
    setSelezionato(null)
  }

  const eventiSelezionati = selezionato ? (eventiPerGiorno[selezionato] ?? []) : []

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* ── Griglia calendario ── */}
      <div className="w-full lg:w-72 shrink-0 rounded-lg border bg-card p-4">
        {/* Navigazione mese */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={mesePrecedente}
            className="rounded p-1 hover:bg-muted transition-colors"
            aria-label="Mese precedente"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold">
            {MESI[mese]} {anno}
          </span>
          <button
            onClick={meseSeguente}
            className="rounded p-1 hover:bg-muted transition-colors"
            aria-label="Mese successivo"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Intestazione giorni settimana */}
        <div className="mb-1 grid grid-cols-7">
          {GIORNI.map(g => (
            <div key={g} className="py-1 text-center text-xs font-medium text-muted-foreground">
              {g}
            </div>
          ))}
        </div>

        {/* Celle giorni */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {celle.map((giorno, i) => {
            if (giorno === null) return <div key={`vuoto-${i}`} />
            const key = chiaveData(anno, mese, giorno)
            const haEventi = !!eventiPerGiorno[key]?.length
            const isOggi = key === oggiKey
            const isSel = key === selezionato

            return (
              <button
                key={key}
                onClick={() => haEventi && setSelezionato(isSel ? null : key)}
                disabled={!haEventi}
                className={cn(
                  'relative flex flex-col items-center justify-center rounded-md py-1.5 text-sm transition-colors',
                  isSel && 'bg-primary text-primary-foreground',
                  !isSel && isOggi && 'font-bold text-primary',
                  !isSel && haEventi && 'font-medium text-foreground hover:bg-accent cursor-pointer',
                  !isSel && !haEventi && 'text-muted-foreground/50 cursor-default',
                )}
              >
                {giorno}
                {haEventi && (
                  <span
                    className={cn(
                      'mt-0.5 h-1 w-1 rounded-full',
                      isSel ? 'bg-primary-foreground' : 'bg-primary',
                    )}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Pannello dettaglio ── */}
      <div className="flex-1">
        {!selezionato ? (
          <div className="flex h-full min-h-48 items-center justify-center rounded-lg border border-dashed p-10 text-center">
            <p className="text-sm text-muted-foreground">
              Seleziona un giorno evidenziato per vedere gli eventi.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground capitalize">
              {new Date(selezionato + 'T12:00:00').toLocaleDateString('it-IT', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>

            {eventiSelezionati.map(evento => (
              <div key={evento.id} className="rounded-lg border bg-card p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold leading-tight">{evento.titolo}</h2>
                  <Badge
                    className="shrink-0"
                    variant={evento.tipo === 'torneo' ? 'default' : 'secondary'}
                  >
                    {evento.tipo}
                  </Badge>
                </div>

                {evento.descrizione && (
                  <p className="text-sm text-muted-foreground">{evento.descrizione}</p>
                )}

                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 shrink-0" />
                    <span>
                      {new Date(evento.data_inizio).toLocaleTimeString('it-IT', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {evento.data_fine && (
                        <>
                          {' → '}
                          {new Date(evento.data_fine).toLocaleTimeString('it-IT', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </>
                      )}
                    </span>
                  </div>
                  {evento.luogo && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>{evento.luogo}</span>
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <div className="flex items-center justify-end gap-2 border-t pt-3">
                    <ModificaEventoDialog evento={evento} />
                    <EliminaEventoButton eventoId={evento.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
