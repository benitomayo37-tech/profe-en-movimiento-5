revoke update, delete on table public.user_activity from authenticated;
grant select, insert on table public.user_activity to authenticated;

drop policy if exists "user_activity_insert_own" on public.user_activity;
create policy "user_activity_insert_own"
on public.user_activity
for insert
to authenticated
with check ((select auth.uid()) = user_id);
