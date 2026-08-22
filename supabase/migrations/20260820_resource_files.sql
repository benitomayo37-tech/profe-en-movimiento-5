-- Profe en Movimiento 5.0
-- Archivos públicos y descargas Premium protegidas para la Biblioteca Profesional.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
  (
    'recursos-publicos',
    'recursos-publicos',
    true,
    20971520,
    array[
      'application/pdf',
      'application/zip',
      'application/x-zip-compressed',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]
  ),
  (
    'recursos-premium',
    'recursos-premium',
    false,
    20971520,
    array[
      'application/pdf',
      'application/zip',
      'application/x-zip-compressed',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "library_files_admin_select" on storage.objects;
create policy "library_files_admin_select"
on storage.objects for select to authenticated
using (
  bucket_id in ('recursos-publicos', 'recursos-premium')
  and exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  )
);

drop policy if exists "library_files_pro_select" on storage.objects;
create policy "library_files_pro_select"
on storage.objects for select to authenticated
using (
  bucket_id = 'recursos-premium'
  and exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and (plan = 'pro' or role = 'admin')
  )
);

drop policy if exists "library_files_admin_insert" on storage.objects;
create policy "library_files_admin_insert"
on storage.objects for insert to authenticated
with check (
  bucket_id in ('recursos-publicos', 'recursos-premium')
  and exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  )
);

drop policy if exists "library_files_admin_update" on storage.objects;
create policy "library_files_admin_update"
on storage.objects for update to authenticated
using (
  bucket_id in ('recursos-publicos', 'recursos-premium')
  and exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  )
)
with check (
  bucket_id in ('recursos-publicos', 'recursos-premium')
  and exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  )
);

drop policy if exists "library_files_admin_delete" on storage.objects;
create policy "library_files_admin_delete"
on storage.objects for delete to authenticated
using (
  bucket_id in ('recursos-publicos', 'recursos-premium')
  and exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  )
);