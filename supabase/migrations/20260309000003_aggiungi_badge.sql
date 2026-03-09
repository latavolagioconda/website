-- Aggiunge badge personalizzati ai soci (assegnati dagli admin)
alter table soci
  add column if not exists badge text[] not null default '{}';

-- Aggiorna la vista pubblica includendo i badge (sempre pubblici, assegnati dall'admin)
drop view if exists vista_profili_pubblici;
create view vista_profili_pubblici as
select
  pp.slug,
  s.nickname,
  s.data_iscrizione,
  s.avatar_url,
  case when s.pubblica_nome_completo  then s.nome               else null end as nome,
  case when s.pubblica_nome_completo  then s.cognome            else null end as cognome,
  case when s.pubblica_bio            then s.bio                else null end as bio,
  case when s.pubblica_giochi         then s.giochi_preferiti   else null end as giochi_preferiti,
  case when s.pubblica_email          then s.email              else null end as email,
  case when s.pubblica_telefono       then s.telefono           else null end as telefono,
  case when s.pubblica_data_nascita   then s.data_nascita::text else null end as data_nascita,
  s.social_x,
  s.social_instagram,
  s.social_bluesky,
  s.social_facebook,
  s.social_discord,
  s.social_steam,
  s.badge
from profili_pubblici pp
join soci s on s.id = pp.socio_id
where pp.abilitato = true;

grant select on vista_profili_pubblici to anon;
grant select on vista_profili_pubblici to authenticated;
