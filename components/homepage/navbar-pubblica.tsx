import Link from 'next/link'

export function NavbarPubblica() {
  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between px-8 sm:px-16 py-5 bg-background border-b-2 border-foreground">
      <img
        src="/logotipo.svg"
        alt="La Tavola Gioconda"
        className="h-10 w-auto"
      />
      <Link
        href="/area-riservata"
        className="text-[0.85rem] tracking-[0.05em] px-6 py-2.5 border-2 border-foreground hover:bg-foreground hover:text-background transition-colors duration-200"
      >
        Area riservata
      </Link>
    </nav>
  )
}
