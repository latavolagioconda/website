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

export const metadata: Metadata = {
  title: 'Soci — La Tavola Gioconda',
}

export default async function SociPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: soci }, { data: socioCorrente }] = await Promise.all([
    supabase
      .from('soci')
      .select('*')
      .order('cognome', { ascending: true }),
    supabase
      .from('soci')
      .select('ruolo')
      .eq('auth_user_id', user.id)
      .single(),
  ])

  // Pagina accessibile solo agli admin
  if (socioCorrente?.ruolo !== 'admin') redirect('/dashboard')

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
              <TableHead className="w-[100px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {soci?.map((socio) => (
              <TableRow key={socio.id}>
                <TableCell className="font-medium">
                  {socio.cognome} {socio.nome}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {socio.email}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={socio.ruolo === 'admin' ? 'default' : 'secondary'}
                  >
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
                <TableCell>
                  <ToggleAttivoButton
                    socioId={socio.id}
                    attivo={socio.attivo}
                  />
                </TableCell>
              </TableRow>
            ))}
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
