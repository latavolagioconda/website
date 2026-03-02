# CLAUDE.md — Sito Associazione Ludica

## Panoramica del Progetto

Sito web per un'associazione ludica. Gestisce soci, eventi e tornei.
Accesso riservato: solo gli utenti aggiunti dall'admin (whitelist) possono accedere.

---

## Stack Tecnologico

| Layer | Tecnologia |
|---|---|
| Frontend | Next.js 14+ (App Router) |
| Stile | Tailwind CSS + shadcn/ui |
| Backend / DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + password, whitelist) |
| Deploy | Vercel |

---

## Struttura del Progetto

```
/
├── app/                        # Next.js App Router
│   ├── (auth)/
│   │   └── login/              # Pagina di login
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Layout protetto (richiede autenticazione)
│   │   ├── dashboard/          # Homepage post-login
│   │   ├── eventi/             # Calendario eventi e tornei
│   │   └── soci/               # Gestione soci (solo admin)
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Redirect a /login o /dashboard
├── components/
│   ├── ui/                     # Componenti shadcn/ui (auto-generati)
│   ├── auth/                   # Componenti legati all'autenticazione
│   ├── eventi/                 # Componenti calendario ed eventi
│   └── soci/                   # Componenti gestione soci
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Supabase client (browser)
│   │   ├── server.ts           # Supabase client (server/SSR)
│   │   └── middleware.ts       # Logica di protezione route
│   └── utils.ts                # Utility generali (cn, date, ecc.)
├── middleware.ts                # Next.js middleware (protezione route)
├── types/
│   └── database.ts             # Tipi TypeScript generati da Supabase
└── supabase/
    └── migrations/             # Migrazioni SQL
```

---

## Autenticazione e Whitelist

### Flusso

1. L'admin crea l'utente direttamente su Supabase Auth (o tramite pannello admin nel sito).
2. L'utente riceve un'email con link per impostare la password.
3. Il login avviene con email + password.
4. Il middleware verifica la sessione su ogni route protetta.

### Implementazione Whitelist

La whitelist è gestita tramite una tabella `soci` in Supabase.
Solo i record presenti in questa tabella (con `auth_user_id` valorizzato) possono accedere.

**Non usare la registrazione pubblica di Supabase Auth.** Disabilitarla dalle impostazioni del progetto Supabase (`Authentication > Providers > Email > Disable sign ups`).

### Ruoli

Gestire i ruoli tramite una colonna `ruolo` nella tabella `soci`:
- `admin` — accesso completo, gestione soci
- `socio` — accesso a eventi e area personale

I ruoli vanno anche salvati nei `user_metadata` di Supabase Auth per un accesso rapido lato client.

---

## Database (Supabase / PostgreSQL)

### Tabelle Principali

```sql
-- Soci dell'associazione
create table soci (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete set null,
  nome text not null,
  cognome text not null,
  email text not null unique,
  ruolo text not null default 'socio' check (ruolo in ('admin', 'socio')),
  data_iscrizione date not null default current_date,
  attivo boolean not null default true,
  created_at timestamptz default now()
);

-- Eventi e tornei
create table eventi (
  id uuid primary key default gen_random_uuid(),
  titolo text not null,
  descrizione text,
  tipo text not null check (tipo in ('evento', 'torneo')),
  data_inizio timestamptz not null,
  data_fine timestamptz,
  luogo text,
  max_partecipanti integer,
  creato_da uuid references soci(id),
  created_at timestamptz default now()
);

-- Partecipazioni agli eventi
create table partecipazioni (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid references eventi(id) on delete cascade,
  socio_id uuid references soci(id) on delete cascade,
  created_at timestamptz default now(),
  unique(evento_id, socio_id)
);
```

### Row Level Security (RLS)

Abilitare RLS su tutte le tabelle. Regole base:

```sql
-- Solo utenti autenticati possono leggere
create policy "Lettura autenticata" on soci
  for select using (auth.role() = 'authenticated');

-- Solo admin possono modificare i soci
create policy "Modifica admin" on soci
  for all using (
    exists (
      select 1 from soci s
      where s.auth_user_id = auth.uid() and s.ruolo = 'admin'
    )
  );
```

---

## Variabili d'Ambiente

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # Solo lato server, mai esporre al client
```

Su Vercel, aggiungere le stesse variabili nelle impostazioni del progetto.

---

## Convenzioni di Codice

- **Lingua**: commenti, nomi variabili, messaggi UI → **italiano**
- **TypeScript**: strict mode attivo, nessun `any` esplicito
- **Componenti**: funzionali con hooks, nessuna classe
- **Naming**: `camelCase` per variabili/funzioni, `PascalCase` per componenti, `kebab-case` per file e cartelle
- **Fetch dati**: preferire Server Components e `async/await` diretti; usare client components solo se necessario (interattività)
- **Errori**: gestire sempre gli errori di Supabase, mostrare toast/alert comprensibili all'utente

---

## Comandi Utili

```bash
# Sviluppo locale
npm run dev

# Build produzione
npm run build

# Generare tipi TypeScript da Supabase
npx supabase gen types typescript --project-id <project-ref> > types/database.ts

# Applicare migrazioni
npx supabase db push
```

---

## Deploy su Vercel

1. Collegare il repository GitHub a Vercel.
2. Impostare le variabili d'ambiente nel pannello Vercel.
3. Il deploy avviene automaticamente ad ogni push su `main`.
4. Usare branch `dev` per sviluppo, `main` per produzione.

---

## Note per Claude

- **Non creare mai flussi di registrazione pubblica.** L'unico modo per aggiungere utenti è tramite l'interfaccia admin o direttamente Supabase.
- Quando aggiungi un socio, usare sempre `supabase.auth.admin.createUser()` lato server (con `service_role_key`), mai lato client.
- Proteggere tutte le route sotto `(dashboard)/` tramite middleware Next.js.
- Usare `shadcn/ui` per tutti i componenti UI; non creare stili custom se esiste già un componente shadcn adeguato.
- Mantenere la separazione tra Server Components (fetch dati, logica) e Client Components (form, interazioni).
