-- Fase 2D: medición del recorrido Free hacia el Plan Pro.

create table if not exists public.commercial_conversion_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid references public.marketing_leads(id) on delete set null,
  event_type text not null check (event_type in ('pro_interest', 'checkout_reached', 'hotmart_reached', 'pro_activated')),
  product_id text not null,
  source text not null default 'direct',
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, event_type, product_id, source)
);

create index if not exists commercial_conversion_events_type_created_idx
  on public.commercial_conversion_events (event_type, created_at desc);

create index if not exists commercial_conversion_events_lead_idx
  on public.commercial_conversion_events (lead_id, created_at desc)
  where lead_id is not null;

alter table public.commercial_conversion_events enable row level security;
revoke all on public.commercial_conversion_events from anon, authenticated;
