-- Profe en Movimiento 5.0
-- Planificador Físico, Fase 1.
-- Sesiones guardadas, cuotas mensuales e historial Free/Pro.

create table if not exists public.physical_planner_usage (
  user_id uuid not null
    references auth.users(id)
    on delete cascade,
  usage_month date not null,
  plan_tier text not null
    check (plan_tier in ('free', 'pro', 'admin')),
  run_count integer not null default 0
    check (run_count >= 0),
  sport_run_count integer not null default 0
    check (sport_run_count >= 0),
  updated_at timestamptz not null
    default timezone('utc', now()),
  primary key (user_id, usage_month)
);

create index if not exists physical_planner_usage_month_idx
  on public.physical_planner_usage (
    usage_month,
    plan_tier
  );

alter table public.physical_planner_usage
  enable row level security;

revoke all on public.physical_planner_usage
  from public, anon, authenticated;

grant select on public.physical_planner_usage
  to authenticated;

drop policy if exists "physical_planner_usage_select_own"
  on public.physical_planner_usage;

create policy "physical_planner_usage_select_own"
  on public.physical_planner_usage
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
  );


create table if not exists public.physical_planner_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null
    references auth.users(id)
    on delete cascade,
  context text not null
    check (
      context in (
        'physical_education',
        'sport'
      )
    ),
  title text not null
    check (char_length(title) between 1 and 180),
  form_data jsonb not null
    check (jsonb_typeof(form_data) = 'object'),
  result_data jsonb not null
    check (jsonb_typeof(result_data) = 'object'),
  created_at timestamptz not null
    default timezone('utc', now()),
  updated_at timestamptz not null
    default timezone('utc', now())
);

create index if not exists physical_planner_sessions_user_created_idx
  on public.physical_planner_sessions (
    user_id,
    created_at desc
  );

create index if not exists physical_planner_sessions_user_context_idx
  on public.physical_planner_sessions (
    user_id,
    context,
    created_at desc
  );

alter table public.physical_planner_sessions
  enable row level security;

revoke all on public.physical_planner_sessions
  from public, anon;

grant select, delete on public.physical_planner_sessions
  to authenticated;

drop policy if exists "physical_planner_sessions_select_own"
  on public.physical_planner_sessions;

create policy "physical_planner_sessions_select_own"
  on public.physical_planner_sessions
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
  );

drop policy if exists "physical_planner_sessions_delete_own"
  on public.physical_planner_sessions;

create policy "physical_planner_sessions_delete_own"
  on public.physical_planner_sessions
  for delete
  to authenticated
  using (
    user_id = (select auth.uid())
  );


create or replace function public.consume_physical_planner_run(
  p_context text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_month date :=
    date_trunc('month', timezone('utc', now()))::date;
  v_plan text;
  v_role text;
  v_tier text;
  v_limit integer;
  v_history_limit integer;
  v_run_count integer;
  v_sport_count integer;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if p_context not in ('physical_education', 'sport') then
    raise exception 'invalid_physical_planner_context';
  end if;

  select
    profile.plan::text,
    profile.role::text
  into
    v_plan,
    v_role
  from public.profiles profile
  where profile.id = v_user_id;

  if v_role = 'admin' then
    v_tier := 'admin';
    v_limit := 1000;
    v_history_limit := 100;
  elsif v_plan = 'pro' then
    v_tier := 'pro';
    v_limit := 40;
    v_history_limit := 50;
  else
    v_tier := 'free';
    v_limit := 2;
    v_history_limit := 3;
  end if;

  insert into public.physical_planner_usage (
    user_id,
    usage_month,
    plan_tier,
    run_count,
    sport_run_count
  )
  values (
    v_user_id,
    v_month,
    v_tier,
    0,
    0
  )
  on conflict (user_id, usage_month)
  do update set
    plan_tier = excluded.plan_tier,
    updated_at = timezone('utc', now());

  select
    usage.run_count,
    usage.sport_run_count
  into
    v_run_count,
    v_sport_count
  from public.physical_planner_usage usage
  where usage.user_id = v_user_id
    and usage.usage_month = v_month
  for update;

  if v_run_count >= v_limit then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'monthly_limit',
      'tier', v_tier,
      'limit', v_limit,
      'used', v_run_count,
      'remaining', 0,
      'historyLimit', v_history_limit
    );
  end if;

  if (
    v_tier = 'free'
    and p_context = 'sport'
    and v_sport_count >= 1
  ) then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'free_sport_limit',
      'tier', v_tier,
      'limit', v_limit,
      'used', v_run_count,
      'remaining', greatest(0, v_limit - v_run_count),
      'historyLimit', v_history_limit
    );
  end if;

  update public.physical_planner_usage
  set
    run_count = run_count + 1,
    sport_run_count =
      sport_run_count
      + case when p_context = 'sport' then 1 else 0 end,
    updated_at = timezone('utc', now())
  where user_id = v_user_id
    and usage_month = v_month
  returning
    run_count,
    sport_run_count
  into
    v_run_count,
    v_sport_count;

  return jsonb_build_object(
    'allowed', true,
    'reason', null,
    'tier', v_tier,
    'limit', v_limit,
    'used', v_run_count,
    'remaining', greatest(0, v_limit - v_run_count),
    'sportUsed', v_sport_count,
    'historyLimit', v_history_limit
  );
end;
$$;


create or replace function public.release_physical_planner_run(
  p_user_id uuid,
  p_context text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_month date :=
    date_trunc('month', timezone('utc', now()))::date;
begin
  if p_context not in ('physical_education', 'sport') then
    return;
  end if;

  update public.physical_planner_usage
  set
    run_count = greatest(0, run_count - 1),
    sport_run_count = greatest(
      0,
      sport_run_count
      - case when p_context = 'sport' then 1 else 0 end
    ),
    updated_at = timezone('utc', now())
  where user_id = p_user_id
    and usage_month = v_month;
end;
$$;


create or replace function public.save_physical_planner_session(
  p_context text,
  p_title text,
  p_form_data jsonb,
  p_result_data jsonb
)
returns public.physical_planner_sessions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_plan text;
  v_role text;
  v_history_limit integer;
  v_title text := btrim(coalesce(p_title, ''));
  v_result public.physical_planner_sessions;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if p_context not in ('physical_education', 'sport') then
    raise exception 'invalid_physical_planner_context';
  end if;

  if char_length(v_title) < 1
    or char_length(v_title) > 180 then
    raise exception 'invalid_physical_planner_title';
  end if;

  if p_form_data is null
    or jsonb_typeof(p_form_data) <> 'object'
    or octet_length(p_form_data::text) > 20000 then
    raise exception 'invalid_physical_planner_form';
  end if;

  if p_result_data is null
    or jsonb_typeof(p_result_data) <> 'object'
    or octet_length(p_result_data::text) > 100000 then
    raise exception 'invalid_physical_planner_result';
  end if;

  select
    profile.plan::text,
    profile.role::text
  into
    v_plan,
    v_role
  from public.profiles profile
  where profile.id = v_user_id;

  if v_role = 'admin' then
    v_history_limit := 100;
  elsif v_plan = 'pro' then
    v_history_limit := 50;
  else
    v_history_limit := 3;
  end if;

  insert into public.physical_planner_sessions (
    user_id,
    context,
    title,
    form_data,
    result_data
  )
  values (
    v_user_id,
    p_context,
    v_title,
    p_form_data,
    p_result_data
  )
  returning *
  into v_result;

  delete from public.physical_planner_sessions session
  where session.user_id = v_user_id
    and session.id in (
      select old_session.id
      from public.physical_planner_sessions old_session
      where old_session.user_id = v_user_id
      order by old_session.created_at desc, old_session.id desc
      offset v_history_limit
    );

  return v_result;
end;
$$;


revoke all on function
  public.consume_physical_planner_run(text)
  from public, anon;

grant execute on function
  public.consume_physical_planner_run(text)
  to authenticated;

revoke all on function
  public.release_physical_planner_run(uuid, text)
  from public, anon, authenticated;

grant execute on function
  public.release_physical_planner_run(uuid, text)
  to service_role;

revoke all on function
  public.save_physical_planner_session(text, text, jsonb, jsonb)
  from public, anon;

grant execute on function
  public.save_physical_planner_session(text, text, jsonb, jsonb)
  to authenticated;

notify pgrst, 'reload schema';