import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AggiungiSocioDialog } from '@/components/soci/aggiungi-socio-dialog'
import { ToggleAttivoButton } from '@/components/soci/toggle-attivo-button'
import { GestisciProfiloDialog } from '@/components/soci/gestisci-profilo-dialog'
import { ModificaSocioDialog } from '@/components/soci/modifica-socio-dialog'

export const metadata: Metadata = {
  title: 'Soci — La Tavola Gioconda',
}

export default async function SociPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/area-riservata')

  const [{ data: soci }, { data: socioCorrente }, { data: profili }] = await Promise.all([
    supabase.from('soci').select('*').order('cognome', { ascending: true }),
    supabase.from('soci').select('ruolo').eq('auth_user_id', user.id).single(),
    supabase.from('profili_pubblici').select('socio_id, slug, abilitato'),
  ])

  // Pagina accessibile solo agli admin
  if (socioCorrente?.ruolo !== 'admin') redirect('/dashboard')

  // Mappa socio_id → profilo per accesso rapido
  const mapProfili = new Map(
    (profili ?? []).map((p) => [p.socio_id, p])
  )

  const totale = soci?.length ?? 0
  const attivi = soci?.filter((s) => s.attivo).length ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Soci</h1>
          <p className="text-muted-foreground">
            {totale} {totale === 1 ? 'socio' : 'soci'} registrati · {attivi}{' '}
            {attivi === 1 ? 'attivo' : 'attivi'}
          </p>
        </div>
        <AggiungiSocioDialog />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Socio</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Ruolo</TableHead>
              <TableHead>Iscritto il</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="w-[140px] text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {soci?.map((socio) => {
              const profilo = mapProfili.get(socio.id) ?? null
              return (
                <TableRow key={socio.id}>
                  <TableCell className="font-medium">
                    {socio.cognome} {socio.nome}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {socio.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={socio.ruolo === 'admin' ? 'default' : 'secondary'}>
                      {socio.ruolo}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(socio.data_iscrizione).toLocaleDateString('it-IT')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={socio.attivo ? 'outline' : 'destructive'}>
                      {socio.attivo ? 'attivo' : 'disattivato'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <ModificaSocioDialog
                        socioId={socio.id}
                        nome={socio.nome}
                        cognome={socio.cognome}
                        badgeIniziali={socio.badge ?? []}
                      />
                      <GestisciProfiloDialog
                        socioId={socio.id}
                        nome={socio.nome}
                        cognome={socio.cognome}
                        profilo={profilo}
                      />
                      <ToggleAttivoButton socioId={socio.id} attivo={socio.attivo} />
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {(!soci || soci.length === 0) && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-muted-foreground"
                >
                  Nessun socio trovato.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
