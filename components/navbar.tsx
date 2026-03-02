'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/(dashboard)/actions'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface NavbarProps {
  nome: string
  cognome: string
  ruolo: string
}

export function Navbar({ nome, cognome, ruolo }: NavbarProps) {
  const pathname = usePathname()

  const iniziali = `${nome[0]}${cognome[0]}`.toUpperCase()

  const voci = [
    { href: '/dashboard', etichetta: 'Dashboard' },
    { href: '/eventi', etichetta: 'Eventi' },
    ...(ruolo === 'admin' ? [{ href: '/soci', etichetta: 'Soci' }] : []),
  ]

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <span className="text-lg font-semibold">La Tavola Gioconda</span>
          <nav className="hidden gap-1 sm:flex">
            {voci.map((voce) => (
              <Link
                key={voce.href}
                href={voce.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                  pathname === voce.href
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {voce.etichetta}
              </Link>
            ))}
          </nav>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{iniziali}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">
                {nome} {cognome}
              </p>
              <p className="text-xs text-muted-foreground capitalize">{ruolo}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={logout} className="w-full">
                <button type="submit" className="w-full cursor-default text-left">
                  Esci
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
