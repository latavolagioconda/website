# CLAUDE.md — Sito La Tavola Gioconda

## Panoramica del Progetto

Sito web per **La Tavola Gioconda**, associazione ludica dedicata ai giochi da tavolo.
- **Homepage pubblica** con descrizione associazione e calendario eventi
- **Area riservata** (`/area-riservata`) per login soci
- **Dashboard interna** per gestione soci, eventi e profilo personale
- Accesso riservato: solo gli utenti aggiunti dall'admin (whitelist) possono accedere all'area interna

---

## Stack Tecnologico

| Layer | Tecnologia |
|---|---|
| Frontend | Next.js 16.1.6 (App Router) |
| Stile | Tailwind CSS v4 + shadcn/ui |
| Backend / DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + password, whitelist) |
| Deploy | Vercel |

> **Nota**: Next.js 16 usa `proxy.ts` con funzione `proxy` (non `middleware.ts`). Sonner al posto di Toast (deprecato in shadcn).

---

## Struttura del Progetto

```
/
├── app/
│   ├── (auth)/
│   │   └── area-riservata/     # Pagina di login (era /login)
│   │       ├── page.tsx
│   │       └── actions.ts
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Layout protetto (richiede auth + whitelist)
│   │   ├── actions.ts          # logout
│   │   ├── dashboard/          # Homepage post-login
│   │   ├── eventi/             # Gestione eventi e tornei
│   │   └── soci/               # Gestione soci (solo admin)
│   ├── layout.tsx              # Root layout (Toaster)
│   ├── not-found.tsx
│   └── page.tsx                # Landing page pubblica (homepage)
├── components/
│   ├── ui/                     # Componenti shadcn/ui
│   ├── auth/                   # login-form.tsx
│   ├── homepage/               # Componenti homepage pubblica
│   │   ├── navbar-pubblica.tsx
│   │   └── calendario-pubblico.tsx
│   ├── eventi/
│   └── soci/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── middleware.ts       # updateSession, protezione route
│   │   └── admin.ts            # client con SERVICE_ROLE_KEY
│   └── utils.ts
├── proxy.ts                    # Next.js 16 proxy (protezione route)
├── types/
│   └── database.ts             # Tipi TypeScript Supabase
└── supabase/
    └── migrations/
        └── 20260308000000_add_pubblico_to_eventi.sql
```

---

## Routing

| URL | Accesso | Descrizione |
|---|---|---|
| `/` | Pubblico | Landing page, calendario eventi pubblici |
| `/area-riservata` | Pubblico | Pagina di login |
| `/p/[slug]` | Pubblico | Profilo pubblico socio (per link NFC tessera) |
| `/dashboard` | Autenticato | Homepage interna |
| `/eventi` | Autenticato | Gestione eventi |
| `/profilo` | Autenticato | Profilo personale + controlli privacy |
| `/soci` | Solo admin | Gestione soci + generazione link NFC |

---

## Autenticazione e Whitelist

### Flusso

1. L'admin crea l'utente direttamente su Supabase Auth (o tramite pannello admin nel sito).
2. L'utente riceve un'email con link per impostare la password.
3. Il login avviene su `/area-riservata` con email + password.
4. Il middleware verifica la sessione su ogni route protetta.

### Implementazione Whitelist

La whitelist è gestita tramite una tabella `soci` in Supabase.
Solo i record presenti in questa tabella (con `auth_user_id` valorizzato) possono accedere.

**Non usare la registrazione pubblica di Supabase Auth.** Disabilitarla dalle impostazioni del progetto Supabase (`Authentication > Providers > Email > Disable sign ups`).

### Ruoli

Gestire i ruoli tramite una colonna `ruolo` nella tabella `soci`:
- `admin` — accesso completo, gestione soci
- `socio` — accesso a eventi e area personale

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
  -- Campi profilo esteso
  telefono text,
  data_nascita date,
  bio text,
  giochi_preferiti text[],
  avatar_url text,
  -- Flag privacy (visibilità nel profilo pubblico)
  pubblica_email boolean not null default false,
  pubblica_telefono boolean not null default false,
  pubblica_data_nascita boolean not null default false,
  pubblica_bio boolean not null default true,
  pubblica_giochi boolean not null default true,
  created_at timestamptz default now()
);

-- Profili pubblici (link NFC per tessera)
create table profili_pubblici (
  id uuid primary key default gen_random_uuid(),
  socio_id uuid references soci(id) on delete cascade unique not null,
  slug text unique not null,
  abilitato boolean not null default true,
  created_at timestamptz not null default now()
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
  pubblico boolean not null default true,   -- visibile sulla homepage pubblica
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

```sql
-- Solo utenti autenticati possono leggere i soci
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

-- Chiunque (anon) può leggere eventi con pubblico = true
create policy "Lettura pubblica eventi" on eventi
  for select to anon using (pubblico = true);
```

---

## Variabili d'Ambiente

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable-key>
SUPABASE_SERVICE_ROLE_KEY=<secret-key>   # Solo lato server, mai esporre al client
```

> Supabase ha rinominato le chiavi: `anon key` → **Publishable key**, `service_role key` → **Secret key**

---

## Convenzioni di Codice

- **Lingua**: commenti, nomi variabili, messaggi UI → **italiano**
- **TypeScript**: strict mode attivo, nessun `any` esplicito
- **Componenti**: funzionali con hooks, nessuna classe
- **Naming**: `camelCase` per variabili/funzioni, `PascalCase` per componenti, `kebab-case` per file e cartelle
- **Fetch dati**: preferire Server Components e `async/await` diretti; usare client components solo se necessario
- **Errori**: gestire sempre gli errori di Supabase, mostrare toast/alert comprensibili all'utente

---

## Comandi Utili

```bash
# Sviluppo locale
npm run dev

# Build produzione
npm run build

# Generare tipi TypeScript da Supabase
npx supabase gen types typescript --project-id sbvwjzwobxstlubmxxzf > types/database.ts

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
- Proteggere tutte le route sotto `(dashboard)/` tramite proxy.ts.
- Il login è su `/area-riservata`, non su `/login`. Non creare mai una route `/login`.
- La homepage `/` è pubblica e non richiede autenticazione. Non aggiungere redirect a `/area-riservata` sulla homepage.
- Usare `shadcn/ui` per tutti i componenti UI; non creare stili custom se esiste già un componente shadcn adeguato.
- Mantenere la separazione tra Server Components (fetch dati, logica) e Client Components (form, interazioni).
- Il contenuto testuale della homepage (indirizzo, orari, descrizione) è nei commenti `TODO` di `app/page.tsx` — chiedere all'utente prima di modificarlo.
