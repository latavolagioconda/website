import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function NavbarPubblica() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-bold tracking-tight">
          La Tavola Gioconda
        </Link>
        <Button asChild variant="outline" size="sm">
          <Link href="/area-riservata">Area riservata</Link>
        </Button>
      </div>
    </header>
  )
}
