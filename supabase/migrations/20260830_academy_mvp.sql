create table if not exists public.academy_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null check (char_length(course_slug) between 1 and 160),
  completed_lessons text[] not null default '{}'::text[],
  quiz_score integer check (quiz_score is null or quiz_score between 0 and 100),
  certificate_earned_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, course_slug)
);

alter table public.academy_progress enable row level security;
revoke all on table public.academy_progress from anon;
grant select, insert, update on table public.academy_progress to authenticated;

drop policy if exists "academy_progress_select_own" on public.academy_progress;
create policy "academy_progress_select_own" on public.academy_progress
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "academy_progress_insert_own" on public.academy_progress;
create policy "academy_progress_insert_own" on public.academy_progress
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "academy_progress_update_own" on public.academy_progress;
create policy "academy_progress_update_own" on public.academy_progress
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
