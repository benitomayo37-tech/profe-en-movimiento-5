-- Profe en Movimiento 5.0
-- Agentes IA: consumo mensual por función y límites avanzados Free/Pro.

create table if not exists public.monthly_agent_feature_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_month date not null,
  feature_key text not null check (feature_key in ('general', 'planning', 'assessment', 'inclusion', 'training_session', 'microcycle', 'mesocycle', 'macrocycle')),
  plan_tier text not null check (plan_tier in ('free', 'pro', 'admin')),
  run_count integer not null default 0 check (run_count >= 0),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, usage_month, feature_key, plan_tier)
);

create index if not exists monthly_agent_feature_usage_month_feature_idx
on public.monthly_agent_feature_usage (usage_month, feature_key, plan_tier);

alter table public.monthly_agent_feature_usage enable row level security;
revoke all on public.monthly_agent_feature_usage from anon;
grant select on public.monthly_agent_feature_usage to authenticated;

drop policy if exists "agent_feature_usage_own" on public.monthly_agent_feature_usage;
create policy "agent_feature_usage_own" on public.monthly_agent_feature_usage for select to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.consume_agent_feature_run(p_feature_key text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_month date := date_trunc('month', timezone('utc', now()))::date;
  v_plan text;
  v_role text;
  v_tier text;
  v_limit integer;
  v_total integer;
  v_feature_count integer;
begin
  if v_user_id is null then raise exception 'not_authenticated'; end if;
  if p_feature_key not in ('general', 'planning', 'assessment', 'inclusion', 'training_session', 'microcycle', 'mesocycle', 'macrocycle') then
    raise exception 'invalid_agent_feature';
  end if;

  select p.plan::text, p.role::text into v_plan, v_role
  from public.profiles p where p.id = v_user_id;

  if v_role = 'admin' then v_tier := 'admin'; v_limit := 1000;
  elsif v_plan = 'pro' then v_tier := 'pro'; v_limit := 100;
  else v_tier := 'free'; v_limit := 3;
  end if;

  if v_tier = 'free' and p_feature_key in ('mesocycle', 'macrocycle') then
    return jsonb_build_object('allowed', false, 'reason', 'pro_required', 'limit', v_limit, 'remaining', greatest(0, v_limit));
  end if;

  insert into public.monthly_agent_usage (user_id, usage_month, run_count)
  values (v_user_id, v_month, 0)
  on conflict (user_id, usage_month) do nothing;

  select u.run_count into v_total
  from public.monthly_agent_usage u
  where u.user_id = v_user_id and u.usage_month = v_month
  for update;

  if v_total >= v_limit then
    return jsonb_build_object('allowed', false, 'reason', 'monthly_limit', 'limit', v_limit, 'remaining', 0, 'used', v_total);
  end if;

  insert into public.monthly_agent_feature_usage (user_id, usage_month, feature_key, plan_tier, run_count)
  values (v_user_id, v_month, p_feature_key, v_tier, 0)
  on conflict (user_id, usage_month, feature_key, plan_tier) do nothing;

  select f.run_count into v_feature_count
  from public.monthly_agent_feature_usage f
  where f.user_id = v_user_id and f.usage_month = v_month and f.feature_key = p_feature_key and f.plan_tier = v_tier
  for update;

  if v_tier = 'free' and p_feature_key = 'microcycle' and v_feature_count >= 1 then
    return jsonb_build_object('allowed', false, 'reason', 'microcycle_limit', 'limit', v_limit, 'remaining', greatest(0, v_limit - v_total), 'used', v_total);
  end if;

  update public.monthly_agent_usage
  set run_count = run_count + 1, updated_at = timezone('utc', now())
  where user_id = v_user_id and usage_month = v_month
  returning run_count into v_total;

  update public.monthly_agent_feature_usage
  set run_count = run_count + 1, updated_at = timezone('utc', now())
  where user_id = v_user_id and usage_month = v_month and feature_key = p_feature_key and plan_tier = v_tier;

  return jsonb_build_object('allowed', true, 'reason', null, 'feature', p_feature_key, 'tier', v_tier, 'limit', v_limit, 'remaining', greatest(0, v_limit - v_total), 'used', v_total);
end;
$$;

create or replace function public.release_agent_feature_run(p_feature_key text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_month date := date_trunc('month', timezone('utc', now()))::date;
  v_plan text;
  v_role text;
  v_tier text;
begin
  if v_user_id is null then return; end if;
  select p.plan::text, p.role::text into v_plan, v_role from public.profiles p where p.id = v_user_id;
  if v_role = 'admin' then v_tier := 'admin';
  elsif v_plan = 'pro' then v_tier := 'pro';
  else v_tier := 'free';
  end if;

  update public.monthly_agent_usage
  set run_count = greatest(0, run_count - 1), updated_at = timezone('utc', now())
  where user_id = v_user_id and usage_month = v_month;

  update public.monthly_agent_feature_usage
  set run_count = greatest(0, run_count - 1), updated_at = timezone('utc', now())
  where user_id = v_user_id and usage_month = v_month and feature_key = p_feature_key and plan_tier = v_tier;
end;
$$;

revoke all on function public.consume_agent_feature_run(text) from public, anon;
revoke all on function public.release_agent_feature_run(text) from public, anon;
grant execute on function public.consume_agent_feature_run(text) to authenticated;
grant execute on function public.release_agent_feature_run(text) to authenticated;
