-- Cartera de clientes de la agencia, gestionada desde el backoffice.
-- Dato puramente interno: sin ninguna policy para el rol `anon`.
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
