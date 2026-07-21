-- Presupuesto y pagos por proyecto. Vive en tabla separada de `projects`
-- (no como columnas sueltas) a propósito: `projects` se lee con la clave
-- anon en la web pública, así que separar la tabla es la barrera de
-- seguridad real, no una simple exclusión de columnas en el SELECT.
-- Sin ninguna policy para `anon`: solo visible/editable desde el backoffice.
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
