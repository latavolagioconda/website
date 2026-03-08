-- Aggiunge il nickname come nome primario del socio
alter table soci
  add column if not exists nickname text,
  add column if not exists pubblica_nome_completo boolean not null default false;

-- Aggiorna la vista pubblica: nickname sempre visibile, nome completo solo se abilitato
drop view if exists vista_profili_pubblici;
create view vista_profili_pubblici as
select
  pp.slug,
  s.nickname,
  s.data_iscrizione,
  s.avatar_url,
  case when s.pubblica_nome_completo   then s.nome               else null end as nome,
  case when s.pubblica_nome_completo   then s.cognome             else null end as cognome,
  case when s.pubblica_bio             then s.bio                 else null end as bio,
  case when s.pubblica_giochi          then s.giochi_preferiti    else null end as giochi_preferiti,
  case when s.pubblica_email           then s.email               else null end as email,
  case when s.pubblica_telefono        then s.telefono            else null end as telefono,
  case when s.pubblica_data_nascita    then s.data_nascita::text  else null end as data_nascita
from profili_pubblici pp
join soci s on s.id = pp.socio_id
where pp.abilitato = true;

grant select on vista_profili_pubblici to anon;
grant select on vista_profili_pubblici to authenticated;
