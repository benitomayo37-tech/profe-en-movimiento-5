-- Profe en Movimiento 5.0
-- Centro de Agentes IA: conversaciones, mensajes, resultados guardados y límites mensuales.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.ai_agent_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 120),
  last_specialist text check (last_specialist is null or last_specialist in ('coordinator', 'planning', 'assessment', 'inclusion')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ai_agent_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_agent_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 20000),
  specialist text check (specialist is null or specialist in ('coordinator', 'planning', 'assessment', 'inclusion')),
  saved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.monthly_agent_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_month date not null,
  run_count integer not null default 0 check (run_count >= 0),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, usage_month)
);

create index if not exists ai_agent_conversations_user_updated_idx on public.ai_agent_conversations (user_id, updated_at desc);
create index if not exists ai_agent_messages_conversation_created_idx on public.ai_agent_messages (conversation_id, created_at);
create index if not exists ai_agent_messages_user_saved_idx on public.ai_agent_messages (user_id, saved_at desc) where saved_at is not null;

alter table public.ai_agent_conversations enable row level security;
alter table public.ai_agent_messages enable row level security;
alter table public.monthly_agent_usage enable row level security;

revoke all on public.ai_agent_conversations, public.ai_agent_messages, public.monthly_agent_usage from anon;
grant select, insert, update, delete on public.ai_agent_conversations to authenticated;
grant select, insert, update, delete on public.ai_agent_messages to authenticated;
grant select on public.monthly_agent_usage to authenticated;

drop policy if exists "agent_conversations_own" on public.ai_agent_conversations;
create policy "agent_conversations_own" on public.ai_agent_conversations for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "agent_messages_own" on public.ai_agent_messages;
create policy "agent_messages_own" on public.ai_agent_messages for all to authenticated
using ((select auth.uid()) = user_id and exists (
  select 1 from public.ai_agent_conversations c where c.id = conversation_id and c.user_id = (select auth.uid())
)) with check ((select auth.uid()) = user_id and exists (
  select 1 from public.ai_agent_conversations c where c.id = conversation_id and c.user_id = (select auth.uid())
));

drop policy if exists "monthly_agent_usage_own" on public.monthly_agent_usage;
create policy "monthly_agent_usage_own" on public.monthly_agent_usage for select to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.consume_agent_run()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_month date := date_trunc('month', timezone('utc', now()))::date;
  v_plan text;
  v_role text;
  v_limit integer;
  v_count integer;
begin
  if v_user_id is null then raise exception 'not_authenticated'; end if;
  select p.plan::text, p.role::text into v_plan, v_role from public.profiles p where p.id = v_user_id;
  if v_role = 'admin' then v_limit := 1000;
  elsif v_plan = 'pro' then v_limit := 100;
  else v_limit := 3;
  end if;

  insert into public.monthly_agent_usage (user_id, usage_month, run_count)
  values (v_user_id, v_month, 1)
  on conflict (user_id, usage_month) do update
  set run_count = public.monthly_agent_usage.run_count + 1, updated_at = timezone('utc', now())
  where public.monthly_agent_usage.run_count < v_limit
  returning run_count into v_count;

  if v_count is null then
    select u.run_count into v_count from public.monthly_agent_usage u where u.user_id = v_user_id and u.usage_month = v_month;
    return jsonb_build_object('allowed', false, 'limit', v_limit, 'remaining', 0, 'used', coalesce(v_count, v_limit));
  end if;
  return jsonb_build_object('allowed', true, 'limit', v_limit, 'remaining', greatest(0, v_limit - v_count), 'used', v_count);
end;
$$;

create or replace function public.release_agent_run()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then return; end if;
  update public.monthly_agent_usage
  set run_count = greatest(0, run_count - 1), updated_at = timezone('utc', now())
  where user_id = auth.uid() and usage_month = date_trunc('month', timezone('utc', now()))::date;
end;
$$;

revoke all on function public.consume_agent_run() from public, anon;
revoke all on function public.release_agent_run() from public, anon;
grant execute on function public.consume_agent_run() to authenticated;
grant execute on function public.release_agent_run() to authenticated;

create or replace function public.touch_agent_conversation()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  update public.ai_agent_conversations set updated_at = timezone('utc', now()) where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists ai_agent_message_touch_conversation on public.ai_agent_messages;
create trigger ai_agent_message_touch_conversation after insert on public.ai_agent_messages
for each row execute procedure public.touch_agent_conversation();
