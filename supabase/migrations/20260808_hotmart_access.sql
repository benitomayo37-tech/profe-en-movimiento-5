-- Profe en Movimiento 5.0
-- Acceso automático al Plan Pro mediante Webhooks de Hotmart.

alter table public.profiles
add column if not exists plan_source text not null default 'manual'
check (plan_source in ('manual', 'hotmart'));

create table if not exists public.hotmart_webhook_events (
  event_id text primary key,
  event_name text not null,
  buyer_email text not null,
  product_id text not null,
  action text not null check (action in ('grant', 'revoke')),
  result text not null,
  received_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.hotmart_entitlements (
  entitlement_key text primary key,
  buyer_email text not null,
  product_id text not null,
  user_id uuid references auth.users(id) on delete set null,
  active boolean not null default false,
  last_event_id text not null,
  activated_at timestamptz,
  revoked_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists hotmart_entitlements_email_idx
on public.hotmart_entitlements (lower(buyer_email));

create index if not exists hotmart_entitlements_user_active_idx
on public.hotmart_entitlements (user_id, active);

alter table public.hotmart_webhook_events enable row level security;
alter table public.hotmart_entitlements enable row level security;

revoke all on table public.hotmart_webhook_events from anon, authenticated;
revoke all on table public.hotmart_entitlements from anon, authenticated;

create or replace function public.process_hotmart_access_event(
  p_event_id text,
  p_event_name text,
  p_buyer_email text,
  p_product_id text,
  p_entitlement_key text,
  p_action text
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
  if p_action not in ('grant', 'revoke') then
    raise exception 'Invalid Hotmart access action';
  end if;

  if trim(coalesce(p_event_id, '')) = ''
    or trim(coalesce(p_event_name, '')) = ''
    or v_email = ''
    or trim(coalesce(p_product_id, '')) = ''
    or trim(coalesce(p_entitlement_key, '')) = '' then
    raise exception 'Incomplete Hotmart event';
  end if;

  insert into public.hotmart_webhook_events (
    event_id,
    event_name,
    buyer_email,
    product_id,
    action,
    result
  ) values (
    p_event_id,
    p_event_name,
    v_email,
    p_product_id,
    p_action,
    'processing'
  )
  on conflict (event_id) do nothing;

  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    return jsonb_build_object('status', 'duplicate');
  end if;

  select users.id
  into v_user_id
  from auth.users as users
  where lower(users.email) = v_email
  limit 1;

  insert into public.hotmart_entitlements (
    entitlement_key,
    buyer_email,
    product_id,
    user_id,
    active,
    last_event_id,
    activated_at,
    revoked_at
  ) values (
    p_entitlement_key,
    v_email,
    p_product_id,
    v_user_id,
    p_action = 'grant',
    p_event_id,
    case when p_action = 'grant' then timezone('utc', now()) else null end,
    case when p_action = 'revoke' then timezone('utc', now()) else null end
  )
  on conflict (entitlement_key) do update
  set buyer_email = excluded.buyer_email,
      product_id = excluded.product_id,
      user_id = coalesce(excluded.user_id, public.hotmart_entitlements.user_id),
      active = excluded.active,
      last_event_id = excluded.last_event_id,
      activated_at = case
        when excluded.active then coalesce(public.hotmart_entitlements.activated_at, timezone('utc', now()))
        else public.hotmart_entitlements.activated_at
      end,
      revoked_at = case when excluded.active then null else timezone('utc', now()) end,
      updated_at = timezone('utc', now());

  if v_user_id is not null then
    if p_action = 'grant' then
      update public.profiles
      set plan = 'pro',
          plan_source = case
            when plan = 'pro' and plan_source = 'manual' then 'manual'
            else 'hotmart'
          end
      where id = v_user_id;
    elsif not exists (
      select 1
      from public.hotmart_entitlements as entitlement
      where entitlement.user_id = v_user_id
        and entitlement.active
    ) then
      update public.profiles
      set plan = 'free', plan_source = 'manual'
      where id = v_user_id
        and plan_source = 'hotmart';
    end if;
  end if;

  update public.hotmart_webhook_events
  set result = case when v_user_id is null then 'awaiting_registration' else 'applied' end
  where event_id = p_event_id;

  return jsonb_build_object(
    'status', case when v_user_id is null then 'awaiting_registration' else 'applied' end,
    'action', p_action
  );
end;
$$;

revoke all on function public.process_hotmart_access_event(text, text, text, text, text, text)
from public, anon, authenticated;
grant execute on function public.process_hotmart_access_event(text, text, text, text, text, text)
to service_role;

-- Vincula compras realizadas antes del registro con la nueva cuenta docente.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_has_active_hotmart_access boolean;
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '')
  )
  on conflict (id) do nothing;

  update public.hotmart_entitlements
  set user_id = new.id,
      updated_at = timezone('utc', now())
  where lower(buyer_email) = lower(new.email)
    and user_id is null;

  select exists (
    select 1
    from public.hotmart_entitlements as entitlement
    where entitlement.user_id = new.id
      and entitlement.active
  ) into v_has_active_hotmart_access;

  if v_has_active_hotmart_access then
    update public.profiles
    set plan = 'pro', plan_source = 'hotmart'
    where id = new.id and plan = 'free';
  end if;

  return new;
end;
$$;
