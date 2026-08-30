create table if not exists public.student_chess_progress (
  student_id uuid primary key references public.student_accounts(id) on delete cascade,
  progress jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.student_chess_progress enable row level security;
revoke all on public.student_chess_progress from anon, authenticated;

