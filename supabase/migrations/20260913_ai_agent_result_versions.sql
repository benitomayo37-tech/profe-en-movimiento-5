-- Profe en Movimiento 5.0
-- Centro de Agentes IA, Fase 2: edición y versiones de resultados guardados.

create table if not exists public.ai_agent_result_versions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null
    references public.ai_agent_messages(id)
    on delete cascade,
  conversation_id uuid not null
    references public.ai_agent_conversations(id)
    on delete cascade,
  user_id uuid not null
    references auth.users(id)
    on delete cascade,
  version_number integer not null
    check (version_number between 1 and 10),
  content text not null
    check (char_length(content) between 1 and 20000),
  created_at timestamptz not null default timezone('utc', now()),
  unique (message_id, version_number)
);

create index if not exists ai_agent_result_versions_message_idx
  on public.ai_agent_result_versions (
    message_id,
    version_number desc
  );

create index if not exists ai_agent_result_versions_user_created_idx
  on public.ai_agent_result_versions (
    user_id,
    created_at desc
  );

alter table public.ai_agent_result_versions
  enable row level security;

revoke all on public.ai_agent_result_versions from public, anon;

grant select, insert on public.ai_agent_result_versions
  to authenticated;

drop policy if exists "agent_result_versions_select_own"
  on public.ai_agent_result_versions;

create policy "agent_result_versions_select_own"
  on public.ai_agent_result_versions
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.ai_agent_messages message
      where message.id = message_id
        and message.conversation_id = conversation_id
        and message.user_id = (select auth.uid())
        and message.role = 'assistant'
        and message.response_kind = 'result'
    )
  );

-- La inserción directa queda cerrada: las versiones se crean mediante
-- una función atómica que valida propiedad, contenido y numeración.
revoke insert on public.ai_agent_result_versions from authenticated;

create or replace function public.save_agent_result_version(
  p_message_id uuid,
  p_content text
)
returns public.ai_agent_result_versions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_message public.ai_agent_messages;
  v_version_number integer;
  v_result public.ai_agent_result_versions;
  v_content text := btrim(coalesce(p_content, ''));
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if char_length(v_content) < 1 or char_length(v_content) > 20000 then
    raise exception 'invalid_content_length';
  end if;

  select message.*
  into v_message
  from public.ai_agent_messages message
  where message.id = p_message_id
    and message.user_id = v_user_id
    and message.role = 'assistant'
    and message.response_kind = 'result';

  if v_message.id is null then
    raise exception 'result_not_found';
  end if;

  -- Bloquea el mensaje mientras calcula la siguiente versión.
  perform 1
  from public.ai_agent_messages message
  where message.id = v_message.id
  for update;

  select coalesce(max(version.version_number), 0) + 1
  into v_version_number
  from public.ai_agent_result_versions version
  where version.message_id = v_message.id;

  if v_version_number > 10 then
    raise exception 'version_limit_reached';
  end if;

  insert into public.ai_agent_result_versions (
    message_id,
    conversation_id,
    user_id,
    version_number,
    content
  )
  values (
    v_message.id,
    v_message.conversation_id,
    v_user_id,
    v_version_number,
    v_content
  )
  returning *
  into v_result;

  update public.ai_agent_messages
  set saved_at = timezone('utc', now())
  where id = v_message.id
    and user_id = v_user_id;

  return v_result;
end;
$$;

revoke all on function public.save_agent_result_version(uuid, text)
  from public, anon;

grant execute on function public.save_agent_result_version(uuid, text)
  to authenticated;

notify pgrst, 'reload schema';