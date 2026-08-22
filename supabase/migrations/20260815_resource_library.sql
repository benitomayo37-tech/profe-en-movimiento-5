create table if not exists public.resource_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_slug text not null check (char_length(resource_slug) between 1 and 160),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, resource_slug)
);

create table if not exists public.resource_stats (
  resource_slug text primary key check (char_length(resource_slug) between 1 and 160),
  view_count bigint not null default 0 check (view_count >= 0),
  download_count bigint not null default 0 check (download_count >= 0),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.resource_favorites enable row level security;
alter table public.resource_stats enable row level security;

revoke all on table public.resource_favorites from anon;
grant select, insert, delete on table public.resource_favorites to authenticated;
grant select on table public.resource_stats to anon, authenticated;

drop policy if exists "resource_favorites_select_own" on public.resource_favorites;
create policy "resource_favorites_select_own"
on public.resource_favorites for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "resource_favorites_insert_own" on public.resource_favorites;
create policy "resource_favorites_insert_own"
on public.resource_favorites for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "resource_favorites_delete_own" on public.resource_favorites;
create policy "resource_favorites_delete_own"
on public.resource_favorites for delete to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "resource_stats_read" on public.resource_stats;
create policy "resource_stats_read"
on public.resource_stats for select to anon, authenticated
using (true);

create or replace function public.record_resource_event(
  p_resource_slug text,
  p_event_type text
)
returns table (view_count bigint, download_count bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_resource_slug is null
    or char_length(trim(p_resource_slug)) < 1
    or char_length(trim(p_resource_slug)) > 160
    or p_event_type not in ('view', 'download') then
    raise exception 'invalid_resource_event';
  end if;

  insert into public.resource_stats (
    resource_slug,
    view_count,
    download_count,
    updated_at
  )
  values (
    trim(p_resource_slug),
    case when p_event_type = 'view' then 1 else 0 end,
    case when p_event_type = 'download' then 1 else 0 end,
    timezone('utc', now())
  )
  on conflict (resource_slug) do update
  set view_count = public.resource_stats.view_count
      + case when p_event_type = 'view' then 1 else 0 end,
      download_count = public.resource_stats.download_count
      + case when p_event_type = 'download' then 1 else 0 end,
      updated_at = timezone('utc', now());

  return query
  select stats.view_count, stats.download_count
  from public.resource_stats as stats
  where stats.resource_slug = trim(p_resource_slug);
end;
$$;

revoke all on function public.record_resource_event(text, text) from public;
grant execute on function public.record_resource_event(text, text) to anon, authenticated;
