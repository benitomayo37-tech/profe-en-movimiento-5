-- Fase 2D: métricas comerciales por usuarios únicos, no por número de orígenes.

create or replace function public.get_commercial_conversion_metrics()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'pro_interest', count(distinct user_id) filter (where event_type = 'pro_interest'),
    'checkout_reached', count(distinct user_id) filter (where event_type = 'checkout_reached'),
    'hotmart_reached', count(distinct user_id) filter (where event_type = 'hotmart_reached'),
    'pro_activated', count(distinct user_id) filter (where event_type = 'pro_activated')
  )
  from public.commercial_conversion_events;
$$;

revoke all on function public.get_commercial_conversion_metrics() from public, anon, authenticated;
grant execute on function public.get_commercial_conversion_metrics() to service_role;
