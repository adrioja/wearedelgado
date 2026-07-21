-- Asocia (opcionalmente) cada proyecto a un cliente de la cartera interna.
alter table public.projects
  add column if not exists client_id uuid references public.clients(id) on delete set null;

create index if not exists projects_client_id_idx on public.projects (client_id);
