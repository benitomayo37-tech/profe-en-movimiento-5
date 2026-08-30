-- Profe en Movimiento 5.0
-- Modalidad de suscripción Hotmart para el panel administrativo.

alter table public.hotmart_webhook_events
add column if not exists offer_code text;

alter table public.hotmart_entitlements
add column if not exists offer_code text;

create index if not exists hotmart_entitlements_offer_active_idx
on public.hotmart_entitlements (offer_code, active);

create or replace function public.process_hotmart_access_event(
  p_event_id text,
  p_event_name text,
  p_buyer_email text,
  p_product_id text,
  p_entitlement_key text,
  p_action text,
  p_offer_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(trim(p_buyer_email));
  v_user_id uuid;
  v_inserted integer;
begin
  if p_action not in ('grant', 'revoke') then raise exception 'Invalid Hotmart access action'; end if;
  if trim(coalesce(p_event_id, '')) = '' or trim(coalesce(p_event_name, '')) = '' or v_email = '' or trim(coalesce(p_product_id, '')) = '' or trim(coalesce(p_entitlement_key, '')) = '' then
    raise exception 'Incomplete Hotmart event';
  end if;

  insert into public.hotmart_webhook_events (event_id, event_name, buyer_email, product_id, offer_code, action, result)
  values (p_event_id, p_event_name, v_email, p_product_id, nullif(trim(coalesce(p_offer_code, '')), ''), p_action, 'processing')
  on conflict (event_id) do nothing;

  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then return jsonb_build_object('status', 'duplicate'); end if;

  select users.id into v_user_id from auth.users as users where lower(users.email) = v_email limit 1;

  insert into public.hotmart_entitlements (entitlement_key, buyer_email, product_id, offer_code, user_id, active, last_event_id, activated_at, revoked_at)
  values (p_entitlement_key, v_email, p_product_id, nullif(trim(coalesce(p_offer_code, '')), ''), v_user_id, p_action = 'grant', p_event_id,
    case when p_action = 'grant' then timezone('utc', now()) else null end,
    case when p_action = 'revoke' then timezone('utc', now()) else null end)
  on conflict (entitlement_key) do update
  set buyer_email = excluded.buyer_email,
      product_id = excluded.product_id,
      offer_code = coalesce(excluded.offer_code, public.hotmart_entitlements.offer_code),
      user_id = coalesce(excluded.user_id, public.hotmart_entitlements.user_id),
      active = excluded.active,
      last_event_id = excluded.last_event_id,
      activated_at = case when excluded.active then coalesce(public.hotmart_entitlements.activated_at, timezone('utc', now())) else public.hotmart_entitlements.activated_at end,
      revoked_at = case when excluded.active then null else timezone('utc', now()) end,
      updated_at = timezone('utc', now());

  if v_user_id is not null then
    if p_action = 'grant' then
      update public.profiles set plan = 'pro', plan_source = case when plan = 'pro' and plan_source = 'manual' then 'manual' else 'hotmart' end where id = v_user_id;
    elsif not exists (select 1 from public.hotmart_entitlements as entitlement where entitlement.user_id = v_user_id and entitlement.active) then
      update public.profiles set plan = 'free', plan_source = 'manual' where id = v_user_id and plan_source = 'hotmart';
    end if;
  end if;

  update public.hotmart_webhook_events set result = case when v_user_id is null then 'awaiting_registration' else 'applied' end where event_id = p_event_id;
  return jsonb_build_object('status', case when v_user_id is null then 'awaiting_registration' else 'applied' end, 'action', p_action);
end;
$$;

revoke all on function public.process_hotmart_access_event(text, text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.process_hotmart_access_event(text, text, text, text, text, text, text) to service_role;
