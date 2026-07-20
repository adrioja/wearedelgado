-- Galería de imágenes adicionales por proyecto (además de la imagen de portada).
create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  url text not null,
  path text not null,
  alt text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.project_images is 'Imágenes adicionales de la galería de cada proyecto, editables desde el backoffice';

alter table public.project_images enable row level security;

create policy "Public can read images of published projects"
  on public.project_images
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_images.project_id and p.is_published = true
    )
  );

create policy "Authenticated can read all project images"
  on public.project_images
  for select
  to authenticated
  using (true);

create policy "Authenticated can insert project images"
  on public.project_images
  for insert
  to authenticated
  with check (true);

create policy "Authenticated can update project images"
  on public.project_images
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated can delete project images"
  on public.project_images
  for delete
  to authenticated
  using (true);

create index if not exists project_images_project_id_idx on public.project_images (project_id, sort_order);
