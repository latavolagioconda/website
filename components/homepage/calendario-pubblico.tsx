import { Tables } from '@/types/database'

type Evento = Pick<
  Tables<'eventi'>,
  'id' | 'titolo' | 'descrizione' | 'tipo' | 'data_inizio' | 'data_fine' | 'luogo'
>

function formatData(iso: string): string {
  return new Date(iso).toLocaleDateString('it-IT', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function CardEvento({ evento }: { evento: Evento }) {
  return (
    <div className="event-card-editorial relative p-8 sm:p-9">
      <div className="ec-date text-xs tracking-[0.12em] uppercase mb-3">
        {formatData(evento.data_inizio)}
      </div>
      <span className="ec-tag text-[0.65rem] tracking-[0.12em] uppercase block mb-3">
        {evento.tipo === 'torneo' ? 'Torneo' : 'Evento'}
      </span>
      <h3
        className="font-bold leading-[1.2] mb-3"
        style={{ fontSize: '1.4rem' }}
      >
        {evento.titolo}
      </h3>
      {evento.descrizione && (
        <p className="text-sm font-light leading-[1.65] opacity-70 line-clamp-3">
          {evento.descrizione}
        </p>
      )}
      {evento.luogo && (
        <div className="mt-3 flex flex-wrap gap-3 text-xs opacity-50">
          <span>{evento.luogo}</span>
        </div>
      )}
    </div>
  )
}

export function CalendarioPubblico({ eventi }: { eventi: Evento[] }) {
  if (eventi.length === 0) {
    return (
      <div className="events-editorial">
        <div className="event-card-editorial p-9 text-sm font-light opacity-60">
          Nessun evento in programma al momento. Torna presto!
        </div>
      </div>
    )
  }

  return (
    <div className="events-editorial grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {eventi.map((evento) => (
        <CardEvento key={evento.id} evento={evento} />
      ))}
    </div>
  )
}
