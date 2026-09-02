-- Profe en Movimiento 5.0
-- Fase 2A del embudo: descarga medible y activacion guiada dentro de la plataforma.

create extension if not exists pgcrypto with schema extensions;

alter table public.marketing_leads
  add column if not exists download_token uuid not null default gen_random_uuid(),
  add column if not exists downloaded_at timestamptz;

create unique index if not exists marketing_leads_download_token_idx
  on public.marketing_leads (download_token);

create index if not exists marketing_leads_downloaded_idx
  on public.marketing_leads (downloaded_at) where downloaded_at is not null;

create table if not exists public.lead_activation_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  lead_id uuid not null unique references public.marketing_leads(id) on delete cascade,
  kit_downloaded_at timestamptz,
  agents_first_run_at timestamptz,
  academy_started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists lead_activation_completed_idx
  on public.lead_activation_progress (completed_at) where completed_at is not null;

alter table public.lead_activation_progress enable row level security;
revoke all on public.lead_activation_progress from anon, authenticated;

