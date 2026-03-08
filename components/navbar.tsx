'use client'

import { useState } from 'react'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard,
  Calendar,
  User,
  Users,
  Menu,
  X,
  LogOut,
} from 'lucide-react'

interface NavbarProps {
  nome: string
  cognome: string
  ruolo: string
  nickname?: string | null
  avatarSrc?: string
}

const vociBase = [
  { href: '/dashboard', etichetta: 'Dashboard', Icona: LayoutDashboard },
  { href: '/eventi',    etichetta: 'Eventi',     Icona: Calendar },
  { href: '/profilo',   etichetta: 'Profilo',    Icona: User },
]

export function Navbar({ nome, cognome, ruolo, nickname, avatarSrc }: NavbarProps) {
  const pathname = usePathname()
  const [menuAperto, setMenuAperto] = useState(false)

  const iniziali = `${nome[0]}${cognome[0]}`.toUpperCase()
  const nomeVisualizzato = nickname || `${nome} ${cognome}`

  const voci = [
    ...vociBase,
    ...(ruolo === 'admin' ? [{ href: '/soci', etichetta: 'Soci', Icona: Users }] : []),
  ]

  return (
    <>
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

          {/* Logo */}
          <Link href="/" className="text-lg font-semibold hover:opacity-80 transition-opacity">
            La Tavola Gioconda
          </Link>

          <div className="flex items-center gap-1">
            {/* Navigazione desktop — solo icone con tooltip nativo */}
            <nav className="hidden sm:flex items-center gap-1 mr-2">
              {voci.map(({ href, etichetta, Icona }) => (
                <Link
                  key={href}
                  href={href}
                  title={etichetta}
                  className={`rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground ${
                    pathname === href
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  <Icona className="h-5 w-5" />
                  <span className="sr-only">{etichetta}</span>
                </Link>
              ))}
            </nav>

            {/* Avatar dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={avatarSrc} alt={nomeVisualizzato} />
                    <AvatarFallback>{iniziali}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{nomeVisualizzato}</p>
                  {nickname && (
                    <p className="text-xs text-muted-foreground">{nome} {cognome}</p>
                  )}
                  <p className="text-xs text-muted-foreground capitalize">{ruolo}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <form action={logout} className="w-full">
                    <button type="submit" className="flex w-full cursor-default items-center gap-2 text-left">
                      <LogOut className="h-4 w-4" />
                      Esci
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Hamburger — solo mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              onClick={() => setMenuAperto(true)}
              aria-label="Apri menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Menu mobile */}
      {menuAperto && (
        <>
          {/* Overlay scuro */}
          <div
            className="fixed inset-0 z-40 bg-black/50 sm:hidden"
            onClick={() => setMenuAperto(false)}
          />

          {/* Pannello laterale */}
          <div className="fixed inset-y-0 right-0 z-50 flex w-64 flex-col bg-background border-l shadow-xl sm:hidden">
            {/* Intestazione pannello */}
            <div className="flex h-16 items-center justify-between border-b px-4">
              <div>
                <p className="text-sm font-medium">{nomeVisualizzato}</p>
                <p className="text-xs text-muted-foreground capitalize">{ruolo}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMenuAperto(false)}
                aria-label="Chiudi menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Voci di navigazione */}
            <nav className="flex flex-1 flex-col gap-1 p-4">
              {voci.map(({ href, etichetta, Icona }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuAperto(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                    pathname === href
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  <Icona className="h-5 w-5 shrink-0" />
                  {etichetta}
                </Link>
              ))}
            </nav>

            {/* Logout in fondo */}
            <div className="border-t p-4">
              <Separator className="mb-4" />
              <form action={logout}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                  Esci
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  )
}
