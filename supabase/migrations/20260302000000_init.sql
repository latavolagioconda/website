-- ============================================================
-- Migrazione iniziale — Associazione Ludica
-- ============================================================

-- ============================================================
-- TABELLA: soci
-- ============================================================
create table if not exists soci (
  id               uuid primary key default gen_random_uuid(),
  auth_user_id     uuid references auth.users(id) on delete set null,
  nome             text not null,
  cognome          text not null,
  email            text not null unique,
  ruolo            text not null default 'socio'
                     check (ruolo in ('admin', 'socio')),
  data_iscrizione  date not null default current_date,
  attivo           boolean not null default true,
  created_at       timestamptz not null default now()
);

-- ============================================================
-- TABELLA: eventi
-- ============================================================
create table if not exists eventi (
  id                 uuid primary key default gen_random_uuid(),
  titolo             text not null,
  descrizione        text,
  tipo               text not null check (tipo in ('evento', 'torneo')),
  data_inizio        timestamptz not null,
  data_fine          timestamptz,
  luogo              text,
  max_partecipanti   integer,
  creato_da          uuid references soci(id) on delete set null,
  created_at         timestamptz not null default now()
);

-- ============================================================
-- TABELLA: partecipazioni
-- ============================================================
create table if not exists partecipazioni (
  id          uuid primary key default gen_random_uuid(),
  evento_id   uuid not null references eventi(id) on delete cascade,
  socio_id    uuid not null references soci(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique(evento_id, socio_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table soci          enable row level security;
alter table eventi        enable row level security;
alter table partecipazioni enable row level security;

-- ============================================================
-- POLICY: soci
-- ============================================================

-- Ogni utente autenticato può leggere tutti i soci
create policy "soci_select_autenticati"
  on soci for select
  using (auth.role() = 'authenticated');

-- Solo gli admin possono inserire nuovi soci
create policy "soci_insert_admin"
  on soci for insert
  with check (
    exists (
      select 1 from soci s
      where s.auth_user_id = auth.uid() and s.ruolo = 'admin'
    )
  );

-- Solo gli admin possono modificare i soci
create policy "soci_update_admin"
  on soci for update
  using (
    exists (
      select 1 from soci s
      where s.auth_user_id = auth.uid() and s.ruolo = 'admin'
    )
  );

-- Solo gli admin possono eliminare i soci
create policy "soci_delete_admin"
  on soci for delete
  using (
    exists (
      select 1 from soci s
      where s.auth_user_id = auth.uid() and s.ruolo = 'admin'
    )
  );

-- ============================================================
-- POLICY: eventi
-- ============================================================

-- Tutti gli autenticati possono leggere gli eventi
create policy "eventi_select_autenticati"
  on eventi for select
  using (auth.role() = 'authenticated');

-- Solo gli admin possono creare eventi
create policy "eventi_insert_admin"
  on eventi for insert
  with check (
    exists (
      select 1 from soci s
      where s.auth_user_id = auth.uid() and s.ruolo = 'admin'
    )
  );

-- Solo gli admin possono modificare eventi
create policy "eventi_update_admin"
  on eventi for update
  using (
    exists (
      select 1 from soci s
      where s.auth_user_id = auth.uid() and s.ruolo = 'admin'
    )
  );

-- Solo gli admin possono eliminare eventi
create policy "eventi_delete_admin"
  on eventi for delete
  using (
    exists (
      select 1 from soci s
      where s.auth_user_id = auth.uid() and s.ruolo = 'admin'
    )
  );

-- ============================================================
-- POLICY: partecipazioni
-- ============================================================

-- Tutti gli autenticati possono vedere le partecipazioni
create policy "partecipazioni_select_autenticati"
  on partecipazioni for select
  using (auth.role() = 'authenticated');

-- Un socio può iscriversi a un evento (solo se stesso)
create policy "partecipazioni_insert_proprio_socio"
  on partecipazioni for insert
  with check (
    exists (
      select 1 from soci s
      where s.auth_user_id = auth.uid() and s.id = socio_id and s.attivo = true
    )
  );

-- Un socio può cancellare solo la propria iscrizione; l'admin può cancellare tutte
create policy "partecipazioni_delete_proprio_o_admin"
  on partecipazioni for delete
  using (
    exists (
      select 1 from soci s
      where s.auth_user_id = auth.uid()
        and (s.id = socio_id or s.ruolo = 'admin')
    )
  );
