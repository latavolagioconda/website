-- ============================================================
-- Funzione helper: controlla se l'utente corrente è admin
-- Usata nelle policy per evitare ricorsione su soci
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

-- Aggiorna le policy usando la funzione helper (più efficiente, no ricorsione)

-- soci
drop policy if exists "soci_insert_admin"             on soci;
drop policy if exists "soci_update_admin"             on soci;
drop policy if exists "soci_delete_admin"             on soci;

create policy "soci_insert_admin"
  on soci for insert
  with check (is_admin());

create policy "soci_update_admin"
  on soci for update
  using (is_admin());

create policy "soci_delete_admin"
  on soci for delete
  using (is_admin());

-- eventi
drop policy if exists "eventi_insert_admin"  on eventi;
drop policy if exists "eventi_update_admin"  on eventi;
drop policy if exists "eventi_delete_admin"  on eventi;

create policy "eventi_insert_admin"
  on eventi for insert
  with check (is_admin());

create policy "eventi_update_admin"
  on eventi for update
  using (is_admin());

create policy "eventi_delete_admin"
  on eventi for delete
  using (is_admin());
