-- We Are Delgado — esquema de base de datos para el formulario de contacto
-- Ejecutar en el SQL Editor de Supabase (o vía `supabase db push`)

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  status text not null default 'nuevo',
  created_at timestamptz not null default now()
);

comment on table public.leads is 'Envíos del formulario de contacto de la landing de We Are Delgado';

alter table public.leads enable row level security;

alter table public.leads
  add constraint leads_status_check
  check (status in ('nuevo', 'contactado', 'en_proceso', 'cerrado', 'descartado'));

create index if not exists leads_status_idx on public.leads (status);

-- El rol anónimo (usado por la server action) solo puede insertar leads,
-- nunca leer, actualizar ni borrar. La lectura y el cambio de estado quedan
-- restringidos al rol autenticado (backoffice).
create policy "Public can insert leads"
  on public.leads
  for insert
  to anon
  with check (
    char_length(name) between 2 and 200
    and char_length(email) between 5 and 320
    and char_length(message) between 10 and 4000
    and phone is not null
    and phone ~ '^[0-9+()\s-]{6,30}$'
    and status = 'nuevo'
  );

create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- El backoffice (usuario autenticado) también debe poder leer y actualizar
-- (cambiar de estado) los leads, sin tocar la policy de insert para `anon`.
create policy "Authenticated can read leads"
  on public.leads
  for select
  to authenticated
  using (true);

create policy "Authenticated can update leads"
  on public.leads
  for update
  to authenticated
  using (true)
  with check (true);

-- =============================================================
-- Backoffice — proyectos, redes sociales y ajustes del sitio
-- =============================================================

-- Cartera de clientes de la agencia. Dato puramente interno: sin ninguna
-- policy para el rol `anon`, nunca se expone en la web pública.
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_person text,
  email text,
  phone text,
  tax_id text,
  address text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.clients is 'Clientes de la agencia, editables desde el backoffice. No accesible públicamente.';

alter table public.clients enable row level security;

create policy "Authenticated can read clients"
  on public.clients
  for select
  to authenticated
  using (true);

create policy "Authenticated can insert clients"
  on public.clients
  for insert
  to authenticated
  with check (true);

create policy "Authenticated can update clients"
  on public.clients
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated can delete clients"
  on public.clients
  for delete
  to authenticated
  using (true);

create index if not exists clients_name_idx on public.clients (name);

-- Proyectos de portfolio, gestionados desde /admin/projects.
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  description text,
  client text,
  year text,
  services text[] not null default '{}'::text[],
  highlight text,
  image_url text,
  image_path text,
  image_alt text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  client_id uuid references public.clients(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.projects is 'Proyectos de portfolio mostrados en la landing, editables desde el backoffice';

alter table public.projects enable row level security;

create policy "Public can read published projects"
  on public.projects
  for select
  to anon, authenticated
  using (is_published = true);

create policy "Authenticated can read all projects"
  on public.projects
  for select
  to authenticated
  using (true);

create policy "Authenticated can manage projects"
  on public.projects
  for insert
  to authenticated
  with check (true);

create policy "Authenticated can update projects"
  on public.projects
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated can delete projects"
  on public.projects
  for delete
  to authenticated
  using (true);

create index if not exists projects_sort_order_idx on public.projects (sort_order);
create index if not exists projects_client_id_idx on public.projects (client_id);

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

-- Presupuesto y pagos por proyecto. Vive en tabla separada de `projects`
-- (no como columnas sueltas) a propósito: `projects` se lee con la clave
-- anon en la web pública, así que separar la tabla es la barrera de
-- seguridad real. Sin ninguna policy para `anon`.
create table if not exists public.project_finance (
  project_id uuid primary key references public.projects(id) on delete cascade,
  budget_amount numeric(12, 2),
  paid_amount numeric(12, 2) not null default 0,
  currency text not null default 'EUR',
  notes text,
  updated_at timestamptz not null default now()
);

comment on table public.project_finance is 'Presupuesto y pagos de cada proyecto. Dato sensible, solo accesible desde el backoffice.';

alter table public.project_finance
  add constraint project_finance_paid_nonnegative check (paid_amount >= 0);

alter table public.project_finance
  add constraint project_finance_budget_nonnegative check (budget_amount is null or budget_amount >= 0);

alter table public.project_finance enable row level security;

create policy "Authenticated can read project finance"
  on public.project_finance
  for select
  to authenticated
  using (true);

create policy "Authenticated can insert project finance"
  on public.project_finance
  for insert
  to authenticated
  with check (true);

create policy "Authenticated can update project finance"
  on public.project_finance
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated can delete project finance"
  on public.project_finance
  for delete
  to authenticated
  using (true);

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

-- Redes sociales mostradas en el footer, lista dinámica editable desde el backoffice.
create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null,
  icon_key text not null check (
    icon_key in (
      'instagram', 'linkedin', 'behance', 'dribbble',
      'x', 'youtube', 'tiktok', 'pinterest', 'website'
    )
  ),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.social_links is 'Redes sociales del footer; icon_key mapea a un set de iconos SVG definido en el código, nunca markup libre';

alter table public.social_links enable row level security;

create policy "Public can read social links"
  on public.social_links
  for select
  to anon, authenticated
  using (true);

create policy "Authenticated can insert social links"
  on public.social_links
  for insert
  to authenticated
  with check (true);

create policy "Authenticated can update social links"
  on public.social_links
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated can delete social links"
  on public.social_links
  for delete
  to authenticated
  using (true);

create index if not exists social_links_sort_order_idx on public.social_links (sort_order);

-- Ajustes generales del sitio (contacto, horario, ubicación). Fila única (singleton).
create table if not exists public.site_settings (
  id smallint primary key default 1,
  contact_intro text,
  contact_email text,
  contact_phone text,
  schedule_text text,
  address_text text,
  address_map_url text,
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id = 1)
);

comment on table public.site_settings is 'Fila única con los ajustes editables de contacto/horario/ubicación de la landing';

alter table public.site_settings enable row level security;

create policy "Public can read site settings"
  on public.site_settings
  for select
  to anon, authenticated
  using (true);

create policy "Authenticated can update site settings"
  on public.site_settings
  for update
  to authenticated
  using (true)
  with check (true);

-- Siembra la fila única de ajustes (idempotente).
insert into public.site_settings (id, contact_intro, contact_email, contact_phone, schedule_text, address_text)
values (
  1,
  'Cuéntanos qué necesitas y te responderemos en menos de 48 horas.',
  null,
  null,
  null,
  null
)
on conflict (id) do nothing;

-- =============================================================
-- Storage — bucket de imágenes de proyectos
-- =============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-images',
  'project-images',
  true,
  20971520, -- 20 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can view project images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'project-images');

create policy "Authenticated can upload project images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'project-images');

create policy "Authenticated can update project images"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'project-images')
  with check (bucket_id = 'project-images');

create policy "Authenticated can delete project images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'project-images');

-- =============================================================
-- Storage — bucket PRIVADO de archivos internos de proyecto
-- =============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-files',
  'project-files',
  false,
  15728640, -- 15 MB
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Authenticated can view project files"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'project-files');

create policy "Authenticated can upload project files"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'project-files');

create policy "Authenticated can delete project files"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'project-files');

-- =============================================================
-- Catálogos descargables
-- =============================================================

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
  52428800, -- 50 MB
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
