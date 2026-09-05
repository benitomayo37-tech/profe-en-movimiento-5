-- Profe en Movimiento 5.0
-- Centro de Agentes IA: gestión segura de conversaciones.

create or replace function public.duplicate_agent_conversation(
  p_conversation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_source public.ai_agent_conversations;
  v_new_conversation_id uuid;
  v_new_message_id uuid;
  v_message record;
  v_plan text;
  v_role text;
  v_limit integer;
  v_count integer;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select conversation.*
  into v_source
  from public.ai_agent_conversations conversation
  where conversation.id = p_conversation_id
    and conversation.user_id = v_user_id;

  if v_source.id is null then
    raise exception 'conversation_not_found';
  end if;

  select profile.plan::text, profile.role::text
  into v_plan, v_role
  from public.profiles profile
  where profile.id = v_user_id;

  if v_role = 'admin' then
    v_limit := 100;
  elsif v_plan = 'pro' then
    v_limit := 30;
  else
    v_limit := 3;
  end if;

  select count(*)
  into v_count
  from public.ai_agent_conversations conversation
  where conversation.user_id = v_user_id;

  if v_count >= v_limit then
    raise exception 'conversation_limit_reached';
  end if;

  insert into public.ai_agent_conversations (
    user_id,
    title,
    last_specialist
  )
  values (
    v_user_id,
    left(v_source.title || ' (copia)', 120),
    v_source.last_specialist
  )
  returning id into v_new_conversation_id;

  for v_message in
    select message.*
    from public.ai_agent_messages message
    where message.conversation_id = v_source.id
      and message.user_id = v_user_id
    order by message.created_at, message.id
  loop
    insert into public.ai_agent_messages (
      conversation_id,
      user_id,
      role,
      content,
      specialist,
      response_kind,
      saved_at,
      created_at
    )
    values (
      v_new_conversation_id,
      v_user_id,
      v_message.role,
      v_message.content,
      v_message.specialist,
      v_message.response_kind,
      v_message.saved_at,
      v_message.created_at
    )
    returning id into v_new_message_id;

    insert into public.ai_agent_result_versions (
      message_id,
      conversation_id,
      user_id,
      version_number,
      content,
      created_at
    )
    select
      v_new_message_id,
      v_new_conversation_id,
      v_user_id,
      version.version_number,
      version.content,
      version.created_at
    from public.ai_agent_result_versions version
    where version.message_id = v_message.id
      and version.user_id = v_user_id
    order by version.version_number;
  end loop;

  update public.ai_agent_conversations
  set updated_at = timezone('utc', now())
  where id = v_new_conversation_id
    and user_id = v_user_id;

  return v_new_conversation_id;
end;
$$;

revoke all on function public.duplicate_agent_conversation(uuid)
from public, anon;

grant execute on function public.duplicate_agent_conversation(uuid)
to authenticated;

notify pgrst, 'reload schema';