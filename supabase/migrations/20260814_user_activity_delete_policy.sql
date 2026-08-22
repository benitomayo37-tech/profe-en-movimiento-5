revoke update on table public.user_activity from authenticated;
grant select, insert, delete on table public.user_activity to authenticated;

drop policy if exists "user_activity_delete_own" on public.user_activity;
create policy "user_activity_delete_own"
on public.user_activity
for delete
to authenticated
using ((select auth.uid()) = user_id);
