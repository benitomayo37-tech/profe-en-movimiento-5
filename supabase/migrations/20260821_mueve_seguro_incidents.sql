-- MueveSeguro - Etapa 5: Historial y seguimiento
-- Tablas y RLS para incidentes educativos y sus seguimientos.
-- Ejecutar después de la migración de perfiles/Auth.

create extension if not exists pgcrypto;

do $$
begin
  create type public.incident_status as enum ('pendiente', 'en_seguimiento', 'cerrado');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.incident_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  code text not null unique default (
    'MS-' || to_char(timezone('utc', now()), 'YYYYMMDDHH24MISS') ||
    substr(replace(gen_random_uuid()::text, '-', ''), 1, 4)
  ),

  institution text not null,
  recipient text not null,
  teacher_name text not null,
  teacher_role text not null,
  student_name text,
  student_class text,

  incident_date date not null,
  incident_time time,
  location text not null,
  activity text not null,
  situation text not null,
  external_help boolean not null default false,

  description text not null,
  actions_taken text not null,
  people_notified text,
  family_notified text,
  witnesses text,
  institutional_protocol text,
  follow_up_required text,
  observations text,

  status public.incident_status not null default 'pendiente',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.incident_followups (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incident_reports(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete restrict,

  follow_up_date date not null default (timezone('utc', now())::date),
  responsible text not null,
  status public.incident_status not null,
  evolution text not null,
  action_required boolean not null default false,
  pending_action text,
  next_review_date date,
  created_at timestamptz not null default timezone('utc', now())
);

-- Índices para el historial.
create index if not exists incident_reports_user_id_idx
  on public.incident_reports(user_id);

create index if not exists incident_reports_date_idx
  on public.incident_reports(incident_date desc);

create index if not exists incident_reports_status_idx
  on public.incident_reports(user_id, status);

create index if not exists incident_reports_situation_idx
  on public.incident_reports(user_id, situation);

create index if not exists incident_followups_incident_id_idx
  on public.incident_followups(incident_id, follow_up_date desc);

create index if not exists incident_followups_user_id_idx
  on public.incident_followups(user_id);

-- Mantener updated_at automáticamente.
drop trigger if exists incident_reports_set_updated_at on public.incident_reports;
create trigger incident_reports_set_updated_at
before update on public.incident_reports
for each row execute procedure public.set_profile_updated_at();

-- Seguridad a nivel de fila.
alter table public.incident_reports enable row level security;
alter table public.incident_followups enable row level security;

revoke all on table public.incident_reports from anon;
revoke all on table public.incident_followups from anon;

revoke all on table public.incident_reports from authenticated;
revoke all on table public.incident_followups from authenticated;

grant select, insert on table public.incident_reports to authenticated;
grant update (status) on table public.incident_reports to authenticated;

grant select, insert on table public.incident_followups to authenticated;

-- El docente solo puede consultar sus propios incidentes.
drop policy if exists "incident_reports_select_own" on public.incident_reports;
create policy "incident_reports_select_own"
on public.incident_reports
for select
to authenticated
using ((select auth.uid()) = user_id);

-- El docente solo puede crear incidentes asociados a su propia cuenta.
drop policy if exists "incident_reports_insert_own" on public.incident_reports;
create policy "incident_reports_insert_own"
on public.incident_reports
for insert
to authenticated
with check ((select auth.uid()) = user_id);

-- El registro original queda protegido: solo se permite actualizar el estado.
drop policy if exists "incident_reports_update_status_own" on public.incident_reports;
create policy "incident_reports_update_status_own"
on public.incident_reports
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- Los seguimientos deben pertenecer al mismo usuario propietario del incidente.
drop policy if exists "incident_followups_select_own" on public.incident_followups;
create policy "incident_followups_select_own"
on public.incident_followups
for select
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.incident_reports ir
    where ir.id = incident_followups.incident_id
      and ir.user_id = (select auth.uid())
  )
);

drop policy if exists "incident_followups_insert_own" on public.incident_followups;
create policy "incident_followups_insert_own"
on public.incident_followups
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.incident_reports ir
    where ir.id = incident_followups.incident_id
      and ir.user_id = (select auth.uid())
  )
);

-- Validación básica para mantener coherencia en acciones pendientes.
create or replace function public.validate_incident_followup()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.action_required = true
     and nullif(trim(coalesce(new.pending_action, '')), '') is null then
    raise exception 'pending_action es obligatorio cuando action_required es true';
  end if;

  if new.action_required = false then
    new.pending_action = null;
  end if;

  return new;
end;
$$;

drop trigger if exists incident_followups_validate on public.incident_followups;
create trigger incident_followups_validate
before insert on public.incident_followups
for each row execute procedure public.validate_incident_followup();

-- Sin eliminación por parte del docente: se conserva la trazabilidad del registro.
