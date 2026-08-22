create extension if not exists pgcrypto;

create table if not exists public.user_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null check (
    activity_type in (
      'profe-ai',
      'training-session',
      'microcycle',
      'mesocycle',
      'macrocycle'
    )
  ),
  title text not null check (char_length(title) between 1 and 180),
  description text not null default '' check (char_length(description) <= 300),
  href text not null check (char_length(href) between 1 and 300),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists user_activity_user_created_idx
on public.user_activity (user_id, created_at desc);

alter table public.user_activity enable row level security;

revoke all on table public.user_activity from anon;
revoke update on table public.user_activity from authenticated;
grant select, insert, delete on table public.user_activity to authenticated;
grant all on table public.user_activity to service_role;

drop policy if exists "user_activity_select_own" on public.user_activity;
create policy "user_activity_select_own"
on public.user_activity
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "user_activity_insert_own" on public.user_activity;
create policy "user_activity_insert_own"
on public.user_activity
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "user_activity_delete_own" on public.user_activity;
create policy "user_activity_delete_own"
on public.user_activity
for delete
to authenticated
using ((select auth.uid()) = user_id);
