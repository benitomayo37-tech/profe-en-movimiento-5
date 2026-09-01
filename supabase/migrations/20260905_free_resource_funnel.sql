-- Profe en Movimiento 5.0
-- Embudo de captacion para recursos gratuitos.

create table if not exists public.marketing_leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null,
  profile_type text not null check (profile_type in ('teacher', 'trainer', 'other')),
  resource_key text not null,
  source text not null default 'direct',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  consent_at timestamptz not null,
  converted_user_id uuid references auth.users(id) on delete set null,
  converted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (email, resource_key)
);

create index if not exists marketing_leads_created_at_idx on public.marketing_leads (created_at desc);
create index if not exists marketing_leads_source_idx on public.marketing_leads (source, resource_key);
create index if not exists marketing_leads_converted_idx on public.marketing_leads (converted_at) where converted_at is not null;

alter table public.marketing_leads enable row level security;
revoke all on public.marketing_leads from anon, authenticated;

create or replace function public.link_marketing_lead_to_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.marketing_leads
  set converted_user_id = new.id,
      converted_at = coalesce(converted_at, timezone('utc', now())),
      updated_at = timezone('utc', now())
  where lower(email) = lower(new.email)
    and converted_user_id is null;
  return new;
end;
$$;

drop trigger if exists link_marketing_lead_after_signup on auth.users;
create trigger link_marketing_lead_after_signup
after insert on auth.users
for each row execute procedure public.link_marketing_lead_to_user();

-- Vincula cuentas que ya existian antes de registrar el lead.
create or replace function public.link_existing_marketing_lead(p_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.marketing_leads as lead
  set converted_user_id = users.id,
      converted_at = coalesce(lead.converted_at, timezone('utc', now())),
      updated_at = timezone('utc', now())
  from auth.users as users
  where lower(users.email) = lower(trim(p_email))
    and lower(lead.email) = lower(trim(p_email))
    and lead.converted_user_id is null;
end;
$$;

revoke all on function public.link_existing_marketing_lead(text) from public, anon, authenticated;
grant execute on function public.link_existing_marketing_lead(text) to service_role;
