-- Profe en Movimiento 5.0
-- Portal estudiantil · Fase 2 · Historial de investigaciones de Historia.

create table if not exists public.student_research_history (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_accounts(id) on delete cascade,
  resource_type text not null check (resource_type in ('history', 'traditional-games', 'sports')),
  topic text not null check (char_length(topic) between 5 and 160),
  generated_content jsonb not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists student_research_history_student_created_idx
on public.student_research_history (student_id, created_at desc);

alter table public.student_research_history enable row level security;
revoke all on table public.student_research_history from anon, authenticated;
grant all on table public.student_research_history to service_role;
