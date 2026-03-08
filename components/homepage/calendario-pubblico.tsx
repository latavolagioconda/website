import { Tables } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, MapPin, Users } from 'lucide-react'

type Evento = Pick<
  Tables<'eventi'>,
  'id' | 'titolo' | 'descrizione' | 'tipo' | 'data_inizio' | 'data_fine' | 'luogo' | 'max_partecipanti'
>

function formatData(iso: string): string {
  return new Date(iso).toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatOra(iso: string): string {
  return new Date(iso).toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function CardEvento({ evento }: { evento: Evento }) {
  const dataInizio = new Date(evento.data_inizio)
  const meseGiorno = dataInizio.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
  const anno = dataInizio.getFullYear()

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start gap-4 space-y-0 pb-2">
        <div className="flex min-w-[3rem] flex-col items-center rounded-md border bg-muted px-2 py-1 text-center">
          <span className="text-xs font-medium uppercase text-muted-foreground">
            {dataInizio.toLocaleDateString('it-IT', { month: 'short' })}
          </span>
          <span className="text-2xl font-bold leading-none">
            {dataInizio.getDate()}
          </span>
          <span className="text-xs text-muted-foreground">{anno}</span>
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-snug">{evento.titolo}</CardTitle>
            <Badge variant={evento.tipo === 'torneo' ? 'default' : 'secondary'} className="shrink-0">
              {evento.tipo === 'torneo' ? 'Torneo' : 'Evento'}
            </Badge>
          </div>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="h-3 w-3" />
            {formatData(evento.data_inizio)} · {formatOra(evento.data_inizio)}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {evento.descrizione && (
          <p className="text-sm text-muted-foreground line-clamp-2">{evento.descrizione}</p>
        )}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {evento.luogo && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {evento.luogo}
            </span>
          )}
          {evento.max_partecipanti && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Max {evento.max_partecipanti} partecipanti
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function CalendarioPubblico({ eventi }: { eventi: Evento[] }) {
  if (eventi.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        Nessun evento in programma al momento. Torna presto!
      </p>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {eventi.map((evento) => (
        <CardEvento key={evento.id} evento={evento} />
      ))}
    </div>
  )
}
