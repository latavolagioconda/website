import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Accedi — La Tavola Gioconda',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">La Tavola Gioconda</h1>
          <p className="text-sm text-muted-foreground">Area riservata</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
