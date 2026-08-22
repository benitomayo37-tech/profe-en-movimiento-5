-- Profe en Movimiento 5.0
-- Límites mensuales para las herramientas gratuitas de Profe IA y Entrenador IA.

create table if not exists public.monthly_ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_month date not null,
  feature text not null check (feature in ('lesson-plan', 'training-session')),
  generation_count integer not null default 0 check (generation_count >= 0),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, usage_month, feature)
);

alter table public.monthly_ai_usage enable row level security;

revoke all on table public.monthly_ai_usage from anon;
revoke insert, update, delete on table public.monthly_ai_usage from authenticated;
grant select on table public.monthly_ai_usage to authenticated;

drop policy if exists "monthly_ai_usage_select_own" on public.monthly_ai_usage;
create policy "monthly_ai_usage_select_own"
on public.monthly_ai_usage
for select
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.consume_free_generation(
  p_feature text,
  p_limit integer default 3
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_month date := date_trunc('month', timezone('utc', now()))::date;
  current_count integer;
  is_unlimited boolean;
begin
  if current_user_id is null then
    raise exception 'authentication_required';
  end if;

  if p_feature not in ('lesson-plan', 'training-session') then
    raise exception 'invalid_feature';
  end if;

  if p_limit < 1 or p_limit > 100 then
    raise exception 'invalid_limit';
  end if;

  select (profiles.plan = 'pro' or profiles.role = 'admin')
  into is_unlimited
  from public.profiles as profiles
  where profiles.id = current_user_id;

  if coalesce(is_unlimited, false) then
    return jsonb_build_object(
      'allowed', true,
      'unlimited', true,
      'used', 0,
      'remaining', null,
      'limit', p_limit
    );
  end if;

  insert into public.monthly_ai_usage (
    user_id,
    usage_month,
    feature,
    generation_count
  )
  values (current_user_id, current_month, p_feature, 1)
  on conflict (user_id, usage_month, feature)
  do update
  set
    generation_count = public.monthly_ai_usage.generation_count + 1,
    updated_at = timezone('utc', now())
  where public.monthly_ai_usage.generation_count < p_limit
  returning generation_count into current_count;

  if current_count is null then
    select usage.generation_count
    into current_count
    from public.monthly_ai_usage as usage
    where usage.user_id = current_user_id
      and usage.usage_month = current_month
      and usage.feature = p_feature;

    return jsonb_build_object(
      'allowed', false,
      'unlimited', false,
      'used', coalesce(current_count, p_limit),
      'remaining', 0,
      'limit', p_limit
    );
  end if;

  return jsonb_build_object(
    'allowed', true,
    'unlimited', false,
    'used', current_count,
    'remaining', greatest(p_limit - current_count, 0),
    'limit', p_limit
  );
end;
$$;

create or replace function public.release_free_generation(
  p_user_id uuid,
  p_feature text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_month date := date_trunc('month', timezone('utc', now()))::date;
begin
  if p_user_id is null then
    return;
  end if;

  if p_feature not in ('lesson-plan', 'training-session') then
    raise exception 'invalid_feature';
  end if;

  update public.monthly_ai_usage
  set
    generation_count = greatest(generation_count - 1, 0),
    updated_at = timezone('utc', now())
  where user_id = p_user_id
    and usage_month = current_month
    and feature = p_feature;
end;
$$;

revoke all on function public.consume_free_generation(text, integer) from public;
revoke all on function public.release_free_generation(uuid, text) from public;
grant execute on function public.consume_free_generation(text, integer) to authenticated;
grant execute on function public.release_free_generation(uuid, text) to service_role;
