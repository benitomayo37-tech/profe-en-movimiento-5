-- Agentes IA: las aclaraciones se conservan en la conversación, pero no consumen cuota.

alter table public.ai_agent_messages
  add column if not exists response_kind text not null default 'result'
  check (response_kind in ('result', 'clarification'));

create index if not exists ai_agent_messages_completed_result_idx
  on public.ai_agent_messages (user_id, created_at)
  where role = 'assistant' and response_kind = 'result';
