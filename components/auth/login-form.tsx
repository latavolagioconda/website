'use client'

import { useActionState } from 'react'
import { login, type StatoLogin } from '@/app/(auth)/area-riservata/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function LoginForm() {
  const [stato, azione, caricamento] = useActionState<StatoLogin, FormData>(
    login,
    null
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accedi</CardTitle>
        <CardDescription>
          Inserisci le credenziali per accedere all&apos;area riservata.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={azione} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nome@esempio.it"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          {stato?.errore && (
            <p className="text-sm text-destructive">{stato.errore}</p>
          )}
          <Button type="submit" className="w-full" disabled={caricamento}>
            {caricamento ? 'Accesso in corso...' : 'Accedi'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
