create table if not exists public.library_catalog_state (
  id boolean primary key default true check (id = true),
  initialized boolean not null default false,
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.library_catalog_state (id, initialized)
values (true, false)
on conflict (id) do nothing;

create table if not exists public.library_resources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 3 and 180),
  summary text not null check (char_length(summary) between 10 and 500),
  description text not null check (char_length(description) between 20 and 5000),
  categories text[] not null default '{}',
  levels text[] not null default '{}',
  formats text[] not null default '{}',
  difficulty text not null default 'Intermedio',
  language text not null default 'Español',
  duration text,
  competencies text[] not null default '{}',
  tags text[] not null default '{}',
  quality text[] not null default '{}',
  cover_image text,
  download_url text,
  preview_url text,
  featured boolean not null default false,
  featured_order integer,
  premium boolean not null default false,
  published boolean not null default false,
  verified boolean not null default false,
  editors_choice boolean not null default false,
  ai_ready boolean not null default true,
  dua boolean not null default false,
  nee boolean not null default false,
  author text not null default 'Profe en Movimiento',
  version text not null default '1.0',
  rating numeric(2,1) not null default 5.0 check (rating between 0 and 5),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists library_resources_published_idx
on public.library_resources (published, featured desc, updated_at desc);

alter table public.library_catalog_state enable row level security;
alter table public.library_resources enable row level security;

grant select on public.library_catalog_state to anon, authenticated;
grant select on public.library_resources to anon, authenticated;
grant insert, update, delete on public.library_resources to authenticated;
grant update on public.library_catalog_state to authenticated;

drop policy if exists "library_catalog_state_read" on public.library_catalog_state;
create policy "library_catalog_state_read"
on public.library_catalog_state for select to anon, authenticated
using (true);

drop policy if exists "library_catalog_state_admin_update" on public.library_catalog_state;
create policy "library_catalog_state_admin_update"
on public.library_catalog_state for update to authenticated
using (exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin'))
with check (exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin'));

drop policy if exists "library_resources_public_read" on public.library_resources;
create policy "library_resources_public_read"
on public.library_resources for select to anon, authenticated
using (
  published
  or exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
);

drop policy if exists "library_resources_admin_insert" on public.library_resources;
create policy "library_resources_admin_insert"
on public.library_resources for insert to authenticated
with check (exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin'));

drop policy if exists "library_resources_admin_update" on public.library_resources;
create policy "library_resources_admin_update"
on public.library_resources for update to authenticated
using (exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin'))
with check (exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin'));

drop policy if exists "library_resources_admin_delete" on public.library_resources;
create policy "library_resources_admin_delete"
on public.library_resources for delete to authenticated
using (exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin'));
