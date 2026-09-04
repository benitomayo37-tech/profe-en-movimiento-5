-- Profe en Movimiento 5.0
-- Agentes IA: devolución segura de ejecuciones y cierre del acceso al RPC legado.

create or replace function public.release_agent_feature_run_for_user(
  p_user_id uuid,
  p_feature_key text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_month date := date_trunc('month', timezone('utc', now()))::date;
  v_plan text;
  v_role text;
  v_tier text;
begin
  if auth.role() <> 'service_role' then
    raise exception 'service_role_required';
  end if;

  if p_user_id is null then
    raise exception 'user_required';
  end if;

  if p_feature_key not in (
    'general',
    'planning',
    'assessment',
    'inclusion',
    'training_session',
    'microcycle',
    'mesocycle',
    'macrocycle'
  ) then
    raise exception 'invalid_agent_feature';
  end if;

  select p.plan::text, p.role::text
  into v_plan, v_role
  from public.profiles p
  where p.id = p_user_id;

  if v_role = 'admin' then
    v_tier := 'admin';
  elsif v_plan = 'pro' then
    v_tier := 'pro';
  else
    v_tier := 'free';
  end if;

  update public.monthly_agent_usage
  set
    run_count = greatest(0, run_count - 1),
    updated_at = timezone('utc', now())
  where user_id = p_user_id
    and usage_month = v_month;

  update public.monthly_agent_feature_usage
  set
    run_count = greatest(0, run_count - 1),
    updated_at = timezone('utc', now())
  where user_id = p_user_id
    and usage_month = v_month
    and feature_key = p_feature_key
    and plan_tier = v_tier;
end;
$$;

revoke all on function public.release_agent_feature_run_for_user(uuid, text)
from public, anon, authenticated;

grant execute on function public.release_agent_feature_run_for_user(uuid, text)
to service_role;

-- Los usuarios autenticados ya no pueden reducir sus propios contadores.
revoke all on function public.release_agent_feature_run(text)
from public, anon, authenticated;

grant execute on function public.release_agent_feature_run(text)
to service_role;

revoke all on function public.release_agent_run()
from public, anon, authenticated;

grant execute on function public.release_agent_run()
to service_role;

notify pgrst, 'reload schema';