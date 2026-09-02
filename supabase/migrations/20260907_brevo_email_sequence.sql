-- Profe en Movimiento 5.0
-- Fase 2B: secuencia automatizada de correos para leads con consentimiento.

create extension if not exists pgcrypto with schema extensions;

alter table public.marketing_leads
  add column if not exists unsubscribe_token uuid not null default gen_random_uuid(),
  add column if not exists unsubscribed_at timestamptz;

create unique index if not exists marketing_leads_unsubscribe_token_idx
  on public.marketing_leads (unsubscribe_token);

create table if not exists public.marketing_email_deliveries (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.marketing_leads(id) on delete cascade,
  sequence_key text not null check (sequence_key in ('welcome', 'agents_1d', 'academy_3d', 'pro_7d')),
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent', 'failed', 'skipped')),
  scheduled_for timestamptz not null,
  sent_at timestamptz,
  provider_message_id text,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  last_error text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (lead_id, sequence_key)
);

create index if not exists marketing_email_due_idx
  on public.marketing_email_deliveries (scheduled_for)
  where status in ('pending', 'failed');

alter table public.marketing_email_deliveries enable row level security;
revoke all on public.marketing_email_deliveries from anon, authenticated;

create or replace function public.claim_due_marketing_emails(p_limit integer default 25)
returns table (delivery_id uuid)
language sql
security definer
set search_path = ''
as $$
  with due as (
    select delivery.id
    from public.marketing_email_deliveries as delivery
    where delivery.status in ('pending', 'failed')
      and delivery.scheduled_for <= timezone('utc', now())
      and delivery.attempt_count < 3
    order by delivery.scheduled_for asc
    limit least(greatest(p_limit, 1), 100)
    for update skip locked
  ), claimed as (
    update public.marketing_email_deliveries as delivery
    set status = 'processing',
        attempt_count = delivery.attempt_count + 1,
        updated_at = timezone('utc', now())
    from due
    where delivery.id = due.id
    returning delivery.id
  )
  select claimed.id as delivery_id from claimed;
$$;

revoke all on function public.claim_due_marketing_emails(integer) from public, anon, authenticated;
grant execute on function public.claim_due_marketing_emails(integer) to service_role;

