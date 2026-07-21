-- Catálogos descargables (PDF) mostrados en la landing y gestionados desde
-- /admin/catalogs. Público en lectura (solo los publicados), como `projects`.
create table if not exists public.catalogs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  file_url text not null,
  file_path text not null,
  file_size_bytes bigint,
  cover_image_url text,
  cover_image_path text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.catalogs is 'Catálogos descargables de la landing, editables desde el backoffice';

alter table public.catalogs enable row level security;

create policy "Public can read published catalogs"
  on public.catalogs
  for select
  to anon, authenticated
  using (is_published = true);

create policy "Authenticated can read all catalogs"
  on public.catalogs
  for select
  to authenticated
  using (true);

create policy "Authenticated can insert catalogs"
  on public.catalogs
  for insert
  to authenticated
  with check (true);

create policy "Authenticated can update catalogs"
  on public.catalogs
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated can delete catalogs"
  on public.catalogs
  for delete
  to authenticated
  using (true);

create index if not exists catalogs_sort_order_idx on public.catalogs (sort_order);

-- Bucket de Storage PÚBLICO: los catálogos se descargan directamente desde
-- la landing, sin autenticación (a diferencia de `project-files`).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'catalogs',
  'catalogs',
  true,
  26214400, -- 25 MB
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can view catalog files"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'catalogs');

create policy "Authenticated can upload catalog files"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'catalogs');

create policy "Authenticated can update catalog files"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'catalogs')
  with check (bucket_id = 'catalogs');

create policy "Authenticated can delete catalog files"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'catalogs');
