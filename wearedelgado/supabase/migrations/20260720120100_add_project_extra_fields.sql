-- Información adicional del proyecto: cliente, año, servicios prestados y un
-- resumen/resultado destacado, mostrados en la página de detalle (/proyectos/[id]).
alter table public.projects
  add column if not exists client text,
  add column if not exists year text,
  add column if not exists services text[] not null default '{}'::text[],
  add column if not exists highlight text;
