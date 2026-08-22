-- Profe en Movimiento 5.0
-- Portal estudiantil, roles y límites de recursos gratuitos.

create extension if not exists pgcrypto with schema extensions;

do $$
begin
  if exists (
    select 1 from pg_enum
    where enumtypid = 'public.app_role'::regtype and enumlabel = 'user'
  ) and not exists (
    select 1 from pg_enum
    where enumtypid = 'public.app_role'::regtype and enumlabel = 'teacher'
  ) then
    alter type public.app_role rename value 'user' to 'teacher';
  end if;
end $$;

alter type public.app_role add value if not exists 'student';

alter table public.profiles
  alter column role set default 'teacher';

update public.profiles
set role = 'teacher'
where role::text = 'user';

create table if not exists public.student_accounts (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 5 and 120),
  normalized_name text not null,
  institution text not null check (char_length(institution) between 2 and 160),
  education_level text not null check (char_length(education_level) between 2 and 80),
  grade_course text not null check (char_length(grade_course) between 1 and 80),
  pin_hash text not null,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.student_accounts enable row level security;
revoke all on table public.student_accounts from anon, authenticated;

create index if not exists student_accounts_normalized_name_idx
on public.student_accounts (normalized_name);

create table if not exists public.student_monthly_usage (
  student_id uuid not null references public.student_accounts(id) on delete cascade,
  usage_month date not null,
  generation_count integer not null default 0 check (generation_count >= 0),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (student_id, usage_month)
);

alter table public.student_monthly_usage enable row level security;
revoke all on table public.student_monthly_usage from anon, authenticated;

create or replace function public.normalize_student_name(value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select lower(regexp_replace(trim(coalesce(value, '')), '\s+', ' ', 'g'));
$$;

create or replace function public.create_student_account(
  p_full_name text,
  p_institution text,
  p_education_level text,
  p_grade_course text,
  p_pin text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_student_id uuid;
  clean_name text := trim(regexp_replace(coalesce(p_full_name, ''), '\s+', ' ', 'g'));
begin
  if char_length(clean_name) < 5 or char_length(clean_name) > 120 then
    raise exception 'invalid_full_name';
  end if;
  if trim(coalesce(p_institution, '')) = '' then raise exception 'invalid_institution'; end if;
  if trim(coalesce(p_education_level, '')) = '' then raise exception 'invalid_education_level'; end if;
  if trim(coalesce(p_grade_course, '')) = '' then raise exception 'invalid_grade_course'; end if;
  if p_pin !~ '^[0-9]{4}$' then raise exception 'invalid_pin'; end if;

  if exists (
    select 1
    from public.student_accounts as students
    where students.normalized_name = public.normalize_student_name(clean_name)
      and students.pin_hash = extensions.crypt(p_pin, students.pin_hash)
  ) then
    raise exception 'student_credentials_exist';
  end if;

  insert into public.student_accounts (
    full_name,
    normalized_name,
    institution,
    education_level,
    grade_course,
    pin_hash
  ) values (
    clean_name,
    public.normalize_student_name(clean_name),
    trim(p_institution),
    trim(p_education_level),
    trim(p_grade_course),
    extensions.crypt(p_pin, extensions.gen_salt('bf', 10))
  )
  returning id into new_student_id;

  return new_student_id;
end;
$$;

create or replace function public.verify_student_account(
  p_full_name text,
  p_pin text
)
returns table (
  id uuid,
  full_name text,
  institution text,
  education_level text,
  grade_course text
)
language sql
security definer
set search_path = ''
as $$
  select
    students.id,
    students.full_name,
    students.institution,
    students.education_level,
    students.grade_course
  from public.student_accounts as students
  where students.normalized_name = public.normalize_student_name(p_full_name)
    and students.active = true
    and students.pin_hash = extensions.crypt(p_pin, students.pin_hash)
  limit 1;
$$;

create or replace function public.consume_student_generation(
  p_student_id uuid,
  p_limit integer default 10
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_month date := date_trunc('month', timezone('utc', now()))::date;
  current_count integer;
  was_consumed boolean := false;
begin
  if p_limit < 1 or p_limit > 100 then raise exception 'invalid_limit'; end if;
  if not exists (
    select 1 from public.student_accounts
    where id = p_student_id and active = true
  ) then raise exception 'invalid_student'; end if;

  insert into public.student_monthly_usage (student_id, usage_month, generation_count)
  values (p_student_id, current_month, 1)
  on conflict (student_id, usage_month)
  do update set
    generation_count = public.student_monthly_usage.generation_count + 1,
    updated_at = timezone('utc', now())
  where public.student_monthly_usage.generation_count < p_limit
  returning generation_count into current_count;

  was_consumed := current_count is not null;

  if current_count is null then
    select usage.generation_count into current_count
    from public.student_monthly_usage as usage
    where usage.student_id = p_student_id and usage.usage_month = current_month;
  end if;

  return jsonb_build_object(
    'allowed', was_consumed,
    'used', least(coalesce(current_count, p_limit), p_limit),
    'remaining', greatest(p_limit - coalesce(current_count, p_limit), 0),
    'limit', p_limit
  );
end;
$$;

revoke all on function public.normalize_student_name(text) from public;
revoke all on function public.create_student_account(text, text, text, text, text) from public;
revoke all on function public.verify_student_account(text, text) from public;
revoke all on function public.consume_student_generation(uuid, integer) from public;

grant execute on function public.normalize_student_name(text) to service_role;
grant execute on function public.create_student_account(text, text, text, text, text) to service_role;
grant execute on function public.verify_student_account(text, text) to service_role;
grant execute on function public.consume_student_generation(uuid, integer) to service_role;
