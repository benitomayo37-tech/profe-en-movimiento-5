-- Auditoría MueveSeguro: acceso PRO, trazabilidad y seguimiento atómico.
-- Ejecutar después de 20260821_mueve_seguro_incidents.sql.

-- Conserva la diferencia entre «No» y «No se sabe» en ayuda externa.
alter table public.incident_reports
  alter column external_help drop not null,
  alter column external_help drop default;

-- Solo las cuentas PRO o administradoras pueden operar con incidentes.
drop policy if exists "incident_reports_select_own" on public.incident_reports;
create policy "incident_reports_select_own"
on public.incident_reports
for select
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and (p.plan = 'pro' or p.role = 'admin')
  )
);

drop policy if exists "incident_reports_insert_own" on public.incident_reports;
create policy "incident_reports_insert_own"
on public.incident_reports
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and status <> 'cerrado'
  and exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and (p.plan = 'pro' or p.role = 'admin')
  )
);

drop policy if exists "incident_reports_update_status_own" on public.incident_reports;
drop policy if exists "incident_followups_insert_own" on public.incident_followups;

-- Las escrituras relacionadas se realizan únicamente mediante la función
-- transaccional. El usuario conserva acceso de lectura a su trazabilidad.
revoke update on table public.incident_reports from authenticated;
revoke insert on table public.incident_followups from authenticated;

drop policy if exists "incident_followups_select_own" on public.incident_followups;
create policy "incident_followups_select_own"
on public.incident_followups
for select
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.incident_reports ir
    join public.profiles p on p.id = ir.user_id
    where ir.id = incident_followups.incident_id
      and ir.user_id = (select auth.uid())
      and (p.plan = 'pro' or p.role = 'admin')
  )
);

create or replace function public.add_incident_followup(
  p_incident_id uuid,
  p_follow_up_date date,
  p_responsible text,
  p_status public.incident_status,
  p_evolution text,
  p_action_required boolean default false,
  p_pending_action text default null,
  p_next_review_date date default null
)
returns public.incident_followups
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_current_status public.incident_status;
  v_followup public.incident_followups;
begin
  if v_user_id is null then
    raise exception 'Sesión no disponible';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = v_user_id
      and (p.plan = 'pro' or p.role = 'admin')
  ) then
    raise exception 'Esta función requiere acceso PRO';
  end if;

  if nullif(trim(coalesce(p_responsible, '')), '') is null then
    raise exception 'El responsable es obligatorio';
  end if;

  if nullif(trim(coalesce(p_evolution, '')), '') is null then
    raise exception 'La evolución es obligatoria';
  end if;

  if p_action_required
     and nullif(trim(coalesce(p_pending_action, '')), '') is null then
    raise exception 'La acción pendiente es obligatoria';
  end if;

  select ir.status
  into v_current_status
  from public.incident_reports ir
  where ir.id = p_incident_id
    and ir.user_id = v_user_id
  for update;

  if not found then
    raise exception 'Incidente no disponible';
  end if;

  if v_current_status = 'cerrado' then
    raise exception 'El incidente está cerrado y no admite nuevas actuaciones';
  end if;

  insert into public.incident_followups (
    incident_id,
    user_id,
    follow_up_date,
    responsible,
    status,
    evolution,
    action_required,
    pending_action,
    next_review_date
  ) values (
    p_incident_id,
    v_user_id,
    coalesce(p_follow_up_date, timezone('America/Guayaquil', now())::date),
    trim(p_responsible),
    p_status,
    trim(p_evolution),
    p_action_required,
    case when p_action_required then trim(p_pending_action) else null end,
    case when p_status = 'cerrado' then null else p_next_review_date end
  )
  returning * into v_followup;

  update public.incident_reports
  set status = p_status
  where id = p_incident_id
    and user_id = v_user_id;

  return v_followup;
end;
$$;

revoke all on function public.add_incident_followup(
  uuid, date, text, public.incident_status, text, boolean, text, date
) from public;

grant execute on function public.add_incident_followup(
  uuid, date, text, public.incident_status, text, boolean, text, date
) to authenticated;
