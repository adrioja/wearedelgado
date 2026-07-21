-- Contador de descargas por catálogo, visible en el backoffice.
alter table public.catalogs
  add column if not exists download_count integer not null default 0;

-- Función security definer para incrementar el contador desde la landing
-- (rol anon) sin darle a ese rol permiso de UPDATE general sobre la tabla
-- (que le permitiría modificar cualquier otro campo, como file_url o name).
create or replace function public.increment_catalog_downloads(catalog_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.catalogs
  set download_count = download_count + 1
  where id = catalog_id and is_published = true;
end;
$$;

grant execute on function public.increment_catalog_downloads(uuid) to anon, authenticated;
