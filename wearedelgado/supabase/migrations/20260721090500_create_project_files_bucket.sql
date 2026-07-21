-- Bucket de Storage PRIVADO para archivos internos de proyecto (distinto de
-- `project-images`, que es público). Sin policy para `anon` en ningún caso:
-- el acceso de descarga se hace siempre vía `createSignedUrl` de corta
-- duración generada desde una server action autenticada del backoffice.
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
