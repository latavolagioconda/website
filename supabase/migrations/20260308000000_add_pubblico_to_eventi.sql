-- Aggiunge colonna per visibilità pubblica degli eventi
alter table eventi
  add column if not exists pubblico boolean not null default true;

-- Policy: chiunque (anche non autenticato) può leggere gli eventi pubblici
create policy "Lettura pubblica eventi"
  on eventi
  for select
  to anon
  using (pubblico = true);
