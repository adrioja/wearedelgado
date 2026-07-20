-- We Are Delgado — esquema de base de datos para el formulario de contacto
-- Ejecutar en el SQL Editor de Supabase (o vía `supabase db push`)

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

comment on table public.leads is 'Envíos del formulario de contacto de la landing de We Are Delgado';

alter table public.leads enable row level security;

-- El rol anónimo (usado por la server action) solo puede insertar leads,
-- nunca leer, actualizar ni borrar. La lectura queda restringida al panel
-- de Supabase / a un rol autenticado interno.
create policy "Public can insert leads"
  on public.leads
  for insert
  to anon
  with check (
    char_length(name) between 2 and 200
    and char_length(email) between 5 and 320
    and char_length(message) between 10 and 4000
  );

create index if not exists leads_created_at_idx on public.leads (created_at desc);
