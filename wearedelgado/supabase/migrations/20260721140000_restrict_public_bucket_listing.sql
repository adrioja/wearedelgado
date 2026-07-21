-- Los buckets 'project-images' y 'catalogs' son públicos: sus objetos se
-- sirven por URL pública directa sin pasar por RLS. La policy de select
-- para anon/authenticated en storage.objects no era necesaria para eso y
-- además permitía listar todo el contenido del bucket, así que se retira:
-- el acceso queda restringido a la URL directa de cada objeto.
drop policy if exists "Public can view project images" on storage.objects;
drop policy if exists "Public can view catalog files" on storage.objects;
