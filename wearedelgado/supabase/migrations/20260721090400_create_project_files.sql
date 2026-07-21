-- Archivos internos por proyecto (facturas, contratos, etc.). No accesibles
-- desde la parte pública bajo ningún concepto: sin policy para `anon`.
create table if not exists public.project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  path text not null,
  size_bytes bigint not null,
  mime_type text not null,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.project_files is 'Archivos internos (facturas, etc.) de cada proyecto. Nunca expuestos públicamente; acceso solo vía backoffice + URL firmada de corta duración.';

alter table public.project_files enable row level security;

create policy "Authenticated can read project files"
  on public.project_files
  for select
  to authenticated
  using (true);

create policy "Authenticated can insert project files"
  on public.project_files
  for insert
  to authenticated
  with check (true);

create policy "Authenticated can delete project files"
  on public.project_files
  for delete
  to authenticated
  using (true);

create index if not exists project_files_project_id_idx on public.project_files (project_id, created_at desc);
