-- Recreacion y Retos Fase 2A
-- Actividades privadas por usuario, estaciones, favoritos y uso.

create table if not exists public.physical_education_recreation_activities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  activity_type text not null check (activity_type in ('juego', 'yincana', 'escape-room', 'reto', 'integracion', 'tradicional')),
  objective text not null,
  level text,
  duration_minutes integer check (duration_minutes is null or duration_minutes between 1 and 600),
  participants text,
  space text,
  materials text,
  instructions text not null,
  adaptations text,
  safety text not null,
  evaluation text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.physical_education_recreation_stations (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.physical_education_recreation_activities(id) on delete cascade,
  station_order integer not null check (station_order > 0),
  title text not null,
  challenge text not null,
  time_minutes integer check (time_minutes is null or time_minutes between 1 and 120),
  materials text,
  instructions text not null,
  unique (activity_id, station_order)
);

create table if not exists public.physical_education_recreation_favorites (
  owner_id uuid not null references auth.users(id) on delete cascade,
  activity_id uuid not null references public.physical_education_recreation_activities(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (owner_id, activity_id)
);

create table if not exists public.physical_education_recreation_usage (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  activity_id uuid not null references public.physical_education_recreation_activities(id) on delete cascade,
  used_at timestamptz not null default timezone('utc', now()),
  observation text
);

create index if not exists recreation_activities_owner_idx on public.physical_education_recreation_activities(owner_id, created_at desc);
create index if not exists recreation_activities_type_idx on public.physical_education_recreation_activities(activity_type, status);
create index if not exists recreation_stations_activity_idx on public.physical_education_recreation_stations(activity_id, station_order);
create index if not exists recreation_usage_owner_idx on public.physical_education_recreation_usage(owner_id, used_at desc);

alter table public.physical_education_recreation_activities enable row level security;
alter table public.physical_education_recreation_stations enable row level security;
alter table public.physical_education_recreation_favorites enable row level security;
alter table public.physical_education_recreation_usage enable row level security;

drop policy if exists recreation_activities_owner_select on public.physical_education_recreation_activities;
create policy recreation_activities_owner_select on public.physical_education_recreation_activities for select using (owner_id = auth.uid());
drop policy if exists recreation_activities_owner_insert on public.physical_education_recreation_activities;
create policy recreation_activities_owner_insert on public.physical_education_recreation_activities for insert with check (owner_id = auth.uid());
drop policy if exists recreation_activities_owner_update on public.physical_education_recreation_activities;
create policy recreation_activities_owner_update on public.physical_education_recreation_activities for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists recreation_activities_owner_delete on public.physical_education_recreation_activities;
create policy recreation_activities_owner_delete on public.physical_education_recreation_activities for delete using (owner_id = auth.uid());

drop policy if exists recreation_stations_owner_all on public.physical_education_recreation_stations;
create policy recreation_stations_owner_all on public.physical_education_recreation_stations for all using (
  exists (select 1 from public.physical_education_recreation_activities a where a.id = activity_id and a.owner_id = auth.uid())
) with check (
  exists (select 1 from public.physical_education_recreation_activities a where a.id = activity_id and a.owner_id = auth.uid())
);

drop policy if exists recreation_favorites_owner_all on public.physical_education_recreation_favorites;
create policy recreation_favorites_owner_all on public.physical_education_recreation_favorites for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists recreation_usage_owner_all on public.physical_education_recreation_usage;
create policy recreation_usage_owner_all on public.physical_education_recreation_usage for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());