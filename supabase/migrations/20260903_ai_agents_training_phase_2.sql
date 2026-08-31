-- Profe en Movimiento 5.0
-- Centro de Agentes IA, fase 2: habilita el especialista de Entrenamiento Deportivo.

alter table public.ai_agent_conversations
  drop constraint if exists ai_agent_conversations_last_specialist_check;

alter table public.ai_agent_conversations
  add constraint ai_agent_conversations_last_specialist_check
  check (last_specialist is null or last_specialist in ('coordinator', 'planning', 'assessment', 'inclusion', 'training'));

alter table public.ai_agent_messages
  drop constraint if exists ai_agent_messages_specialist_check;

alter table public.ai_agent_messages
  add constraint ai_agent_messages_specialist_check
  check (specialist is null or specialist in ('coordinator', 'planning', 'assessment', 'inclusion', 'training'));
