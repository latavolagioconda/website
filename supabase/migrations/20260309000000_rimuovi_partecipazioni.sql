-- Rimuove la gestione partecipanti (non utilizzata)
drop table if exists public.partecipazioni;

alter table public.eventi drop column if exists max_partecipanti;
