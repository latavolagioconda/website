-- ============================================================
-- DB INIT — La Tavola Gioconda
-- Stato attuale del database (tutte le migration consolidate)
-- Da eseguire su un progetto Supabase vuoto
-- ============================================================


-- ============================================================
-- FUNZIONE HELPER: is_admin()
-- Usata nelle policy per evitare ricorsione sulla tabella soci
-- ============================================================
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from soci
    where auth_user_id = auth.uid() and ruolo = 'admin'
  );
$$;


-- ============================================================
-- TABELLA: soci
-- ============================================================
create table if not exists soci (
  id                      uuid primary key default gen_random_uuid(),
  auth_user_id            uuid references auth.users(id) on delete set null,
  nome                    text not null,
  cognome                 text not null,
  email                   text not null unique,
  ruolo                   text not null default 'socio'
                            check (ruolo in ('admin', 'socio')),
  data_iscrizione         date not null default current_date,
  attivo                  boolean not null default true,
  -- Profilo esteso
  nickname                text,
  telefono                text,
  data_nascita            date,
  bio                     text,
  giochi_preferiti        text[],
  avatar_url              text,
  -- Flag privacy
  pubblica_nome_completo  boolean not null default false,
  pubblica_email          boolean not null default false,
  pubblica_telefono       boolean not null default false,
  pubblica_data_nascita   boolean not null default false,
  pubblica_bio            boolean not null default true,
  pubblica_giochi         boolean not null default true,
  -- Social
  social_x                text,
  social_instagram        text,
  social_bluesky          text,
  social_facebook         text,
  social_discord          text,
  social_steam            text,
  created_at              timestamptz not null default now()
);

alter table soci enable row level security;

-- Ogni utente autenticato può leggere tutti i soci
create policy "soci_select_autenticati"
  on soci for select
  using (auth.role() = 'authenticated');

-- Solo admin può inserire, modificare, eliminare soci
create policy "soci_insert_admin"
  on soci for insert
  with check (is_admin());

create policy "soci_update_admin"
  on soci for update
  using (is_admin());

create policy "soci_delete_admin"
  on soci for delete
  using (is_admin());


-- ============================================================
-- TABELLA: eventi
-- ============================================================
create table if not exists eventi (
  id           uuid primary key default gen_random_uuid(),
  titolo       text not null,
  descrizione  text,
  tipo         text not null check (tipo in ('evento', 'torneo')),
  data_inizio  timestamptz not null,
  data_fine    timestamptz,
  luogo        text,
  pubblico     boolean not null default true,
  creato_da    uuid references soci(id) on delete set null,
  created_at   timestamptz not null default now()
);

alter table eventi enable row level security;

-- Utenti autenticati possono leggere tutti gli eventi
create policy "eventi_select_autenticati"
  on eventi for select
  using (auth.role() = 'authenticated');

-- Chiunque (anon) può leggere gli eventi pubblici (per la homepage)
create policy "eventi_select_pubblici_anon"
  on eventi for select to anon
  using (pubblico = true);

-- Solo admin può creare, modificare, eliminare eventi
create policy "eventi_insert_admin"
  on eventi for insert
  with check (is_admin());

create policy "eventi_update_admin"
  on eventi for update
  using (is_admin());

create policy "eventi_delete_admin"
  on eventi for delete
  using (is_admin());


-- ============================================================
-- TABELLA: profili_pubblici
-- Link NFC per tessera socio
-- ============================================================
create table if not exists profili_pubblici (
  id         uuid primary key default gen_random_uuid(),
  socio_id   uuid references soci(id) on delete cascade unique not null,
  slug       text unique not null,
  abilitato  boolean not null default true,
  created_at timestamptz not null default now()
);

alter table profili_pubblici enable row level security;

-- Chiunque può leggere i profili abilitati (pagina pubblica /p/[slug])
create policy "profili_pubblici_select_anon"
  on profili_pubblici for select to anon
  using (abilitato = true);

-- Utenti autenticati possono leggere tutti i profili (pannello admin)
create policy "profili_pubblici_select_autenticati"
  on profili_pubblici for select to authenticated
  using (true);

-- Solo admin può creare, modificare, eliminare profili pubblici
create policy "profili_pubblici_gestione_admin"
  on profili_pubblici for all to authenticated
  using (is_admin());


-- ============================================================
-- VISTA: vista_profili_pubblici
-- Applica i flag privacy a livello DB
-- ============================================================
create or replace view vista_profili_pubblici as
select
  pp.slug,
  s.nickname,
  s.data_iscrizione,
  s.avatar_url,
  case when s.pubblica_nome_completo  then s.nome              else null end as nome,
  case when s.pubblica_nome_completo  then s.cognome           else null end as cognome,
  case when s.pubblica_bio            then s.bio               else null end as bio,
  case when s.pubblica_giochi         then s.giochi_preferiti  else null end as giochi_preferiti,
  case when s.pubblica_email          then s.email             else null end as email,
  case when s.pubblica_telefono       then s.telefono          else null end as telefono,
  case when s.pubblica_data_nascita   then s.data_nascita::text else null end as data_nascita,
  s.social_x,
  s.social_instagram,
  s.social_bluesky,
  s.social_facebook,
  s.social_discord,
  s.social_steam
from profili_pubblici pp
join soci s on s.id = pp.socio_id
where pp.abilitato = true;

grant select on vista_profili_pubblici to anon;
grant select on vista_profili_pubblici to authenticated;
