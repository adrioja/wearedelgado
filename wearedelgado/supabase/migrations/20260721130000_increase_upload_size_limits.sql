-- Los catálogos y las fotos de proyecto son material en alta calidad, así
-- que subimos los límites de tamaño de los buckets ya existentes.
update storage.buckets
set file_size_limit = 20971520 -- 20 MB
where id = 'project-images';

update storage.buckets
set file_size_limit = 52428800 -- 50 MB
where id = 'catalogs';
