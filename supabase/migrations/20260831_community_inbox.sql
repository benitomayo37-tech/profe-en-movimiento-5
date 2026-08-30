create table if not exists public.community_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('topic', 'experience', 'question', 'improvement')),
  subject text not null check (char_length(subject) between 5 and 160),
  message text not null check (char_length(message) between 20 and 4000),
  status text not null default 'pending' check (status in ('pending', 'reviewing', 'resolved', 'archived')),
  admin_response text check (admin_response is null or char_length(admin_response) <= 4000),
  responded_by uuid references auth.users(id) on delete set null,
  responded_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists community_submissions_user_created_idx
on public.community_submissions (user_id, created_at desc);

create index if not exists community_submissions_status_created_idx
on public.community_submissions (status, created_at desc);

alter table public.community_submissions enable row level security;
revoke all on table public.community_submissions from anon;
grant select, insert, update on table public.community_submissions to authenticated;

drop policy if exists "community_select_own_or_admin" on public.community_submissions;
create policy "community_select_own_or_admin" on public.community_submissions
for select to authenticated using (
  user_id = (select auth.uid())
  or exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
);

drop policy if exists "community_insert_own" on public.community_submissions;
create policy "community_insert_own" on public.community_submissions
for insert to authenticated with check (
  user_id = (select auth.uid())
  and status = 'pending'
  and admin_response is null
  and responded_by is null
  and responded_at is null
);

drop policy if exists "community_admin_update" on public.community_submissions;
create policy "community_admin_update" on public.community_submissions
for update to authenticated using (
  exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
) with check (
  exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
);

