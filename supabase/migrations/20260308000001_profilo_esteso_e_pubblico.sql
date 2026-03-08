-- Fase C+D: Profilo esteso e profili pubblici con link NFC

-- 1. Campi aggiuntivi per il profilo del socio
alter table soci
  add column if not exists telefono text,
  add column if not exists data_nascita date,
  add column if not exists bio text,
  add column if not exists giochi_preferiti text[],
  add column if not exists avatar_url text,
  add column if not exists pubblica_email boolean not null default false,
  add column if not exists pubblica_telefono boolean not null default false,
  add column if not exists pubblica_data_nascita boolean not null default false,
  add column if not exists pubblica_bio boolean not null default true,
  add column if not exists pubblica_giochi boolean not null default true;

-- 2. Tabella per i profili pubblici (usati con link NFC su tessera)
create table if not exists profili_pubblici (
  id uuid primary key default gen_random_uuid(),
  socio_id uuid references soci(id) on delete cascade unique not null,
  slug text unique not null,
  abilitato boolean not null default true,
  created_at timestamptz not null default now()
);

alter table profili_pubblici enable row level security;

-- Chiunque può leggere i profili abilitati (per la pagina pubblica)
create policy "Lettura pubblica profili abilitati"
  on profili_pubblici for select to anon
  using (abilitato = true);

-- Utenti autenticati possono leggere tutti i profili (per il pannello admin)
create policy "Lettura autenticata profili"
  on profili_pubblici for select to authenticated
  using (true);

-- Solo admin può creare/modificare/eliminare profili pubblici
create policy "Gestione admin profili pubblici"
  on profili_pubblici for all to authenticated
  using (
    exists (
      select 1 from soci s
      where s.auth_user_id = auth.uid() and s.ruolo = 'admin'
    )
  );

-- 3. Vista pubblica che applica i filtri privacy a livello DB
create or replace view vista_profili_pubblici as
select
  pp.slug,
  s.nome,
  s.cognome,
  s.data_iscrizione,
  s.avatar_url,
  case when s.pubblica_bio     then s.bio               else null end as bio,
  case when s.pubblica_giochi  then s.giochi_preferiti  else null end as giochi_preferiti,
  case when s.pubblica_email   then s.email              else null end as email,
  case when s.pubblica_telefono      then s.telefono          else null end as telefono,
  case when s.pubblica_data_nascita  then s.data_nascita::text else null end as data_nascita
from profili_pubblici pp
join soci s on s.id = pp.socio_id
where pp.abilitato = true;

grant select on vista_profili_pubblici to anon;
grant select on vista_profili_pubblici to authenticated;
