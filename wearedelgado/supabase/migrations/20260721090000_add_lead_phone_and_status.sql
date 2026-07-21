-- Añade teléfono móvil (obligatorio para leads nuevos) y estado de seguimiento
-- comercial a los mensajes de contacto, gestionable desde el backoffice.

alter table public.leads
  add column if not exists phone text,
  add column if not exists status text not null default 'nuevo';

alter table public.leads
  add constraint leads_status_check
  check (status in ('nuevo', 'contactado', 'en_proceso', 'cerrado', 'descartado'));

create index if not exists leads_status_idx on public.leads (status);

-- Sustituye la policy de insert público para exigir también un teléfono
-- válido y que el estado inicial sea siempre 'nuevo' (defensa en profundidad,
-- aunque el default de la columna ya lo garantiza).
drop policy if exists "Public can insert leads" on public.leads;

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

-- Necesaria para poder cambiar el estado de un lead desde el backoffice.
create policy "Authenticated can update leads"
  on public.leads
  for update
  to authenticated
  using (true)
  with check (true);
