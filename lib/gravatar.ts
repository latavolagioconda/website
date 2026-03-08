import { createHash } from 'crypto'

/**
 * Restituisce l'URL Gravatar per una data email.
 * Usabile solo lato server (Node.js crypto).
 * @param email  Email dell'utente
 * @param size   Dimensione in pixel (default 200)
 */
export function gravatarUrl(email: string, size = 200): string {
  const hash = createHash('md5').update(email.trim().toLowerCase()).digest('hex')
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=mp`
}
