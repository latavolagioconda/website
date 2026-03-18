-- Permette a ogni socio autenticato di aggiornare il proprio record
-- (solo i campi del profilo — nome, cognome, ruolo, attivo restano
-- modificabili solo dagli admin tramite la policy esistente)
create policy "Modifica profilo personale"
  on soci
  for update
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());
