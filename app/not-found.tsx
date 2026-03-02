import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">Errore 404</p>
        <h1 className="mt-2 text-3xl font-bold">Pagina non trovata</h1>
        <p className="mt-3 text-muted-foreground">
          La pagina che cerchi non esiste o è stata spostata.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">Torna alla dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
