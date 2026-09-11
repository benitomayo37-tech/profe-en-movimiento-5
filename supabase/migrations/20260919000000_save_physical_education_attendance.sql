-- Profe en Movimiento 5.0
-- Cuaderno Digital de Educación Física
-- Guardado atómico de asistencia.

create or replace function
  public.save_physical_education_attendance(
    p_course_id uuid,
    p_attendance_date date,
    p_class_note text,
    p_entries jsonb
  )
returns uuid
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_teacher_id uuid := auth.uid();
  v_session_id uuid;
  v_entry_count integer;
  v_distinct_student_count integer;
  v_owned_student_count integer;
begin
  if v_teacher_id is null then
    raise exception
      'Debes iniciar sesión.'
      using errcode = '42501';
  end if;

  if p_course_id is null then
    raise exception
      'El curso es obligatorio.'
      using errcode = '22023';
  end if;

  if p_attendance_date is null
     or p_attendance_date < date '2000-01-01'
     or p_attendance_date > date '2100-12-31' then
    raise exception
      'La fecha de asistencia no es válida.'
      using errcode = '22023';
  end if;

  if p_class_note is not null
     and (
       char_length(btrim(p_class_note)) = 0
       or char_length(btrim(p_class_note)) > 500
     ) then
    raise exception
      'La nota de clase no es válida.'
      using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.physical_education_courses as course_row
    where course_row.id = p_course_id
      and course_row.teacher_id = v_teacher_id
  ) then
    raise exception
      'El curso no existe o no tienes acceso.'
      using errcode = '42501';
  end if;

  if p_entries is null
     or jsonb_typeof(p_entries) <> 'array' then
    raise exception
      'La lista de asistencia no es válida.'
      using errcode = '22023';
  end if;

  v_entry_count := jsonb_array_length(p_entries);

  if v_entry_count < 1 or v_entry_count > 500 then
    raise exception
      'La asistencia debe contener entre 1 y 500 estudiantes.'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_entries) as entry_row(
      student_id uuid,
      status text,
      observation text
    )
    where entry_row.student_id is null
       or entry_row.status is null
       or entry_row.status not in (
         'present',
         'absent',
         'late',
         'excused'
       )
       or (
         entry_row.observation is not null
         and (
           char_length(btrim(entry_row.observation)) = 0
           or char_length(btrim(entry_row.observation)) > 500
         )
       )
  ) then
    raise exception
      'Uno o más registros de asistencia no son válidos.'
      using errcode = '22023';
  end if;

  select count(distinct entry_row.student_id)
  into v_distinct_student_count
  from jsonb_to_recordset(p_entries) as entry_row(
    student_id uuid,
    status text,
    observation text
  );

  if v_distinct_student_count <> v_entry_count then
    raise exception
      'No se permiten estudiantes repetidos.'
      using errcode = '22023';
  end if;

  select count(*)
  into v_owned_student_count
  from jsonb_to_recordset(p_entries) as entry_row(
    student_id uuid,
    status text,
    observation text
  )
  join public.physical_education_students as student_row
    on student_row.id = entry_row.student_id
   and student_row.course_id = p_course_id
   and student_row.teacher_id = v_teacher_id;

  if v_owned_student_count <> v_entry_count then
    raise exception
      'Uno o más estudiantes no pertenecen al curso.'
      using errcode = '42501';
  end if;

  insert into
    public.physical_education_attendance_sessions (
      teacher_id,
      course_id,
      attendance_date,
      class_note
    )
  values (
    v_teacher_id,
    p_course_id,
    p_attendance_date,
    nullif(btrim(p_class_note), '')
  )
  on conflict (course_id, attendance_date)
  do update set
    class_note = excluded.class_note,
    updated_at = timezone('utc', now())
  returning id into v_session_id;

  insert into
    public.physical_education_attendance_records (
      teacher_id,
      attendance_session_id,
      course_id,
      student_id,
      status,
      observation
    )
  select
    v_teacher_id,
    v_session_id,
    p_course_id,
    entry_row.student_id,
    entry_row.status,
    nullif(btrim(entry_row.observation), '')
  from jsonb_to_recordset(p_entries) as entry_row(
    student_id uuid,
    status text,
    observation text
  )
  on conflict (attendance_session_id, student_id)
  do update set
    status = excluded.status,
    observation = excluded.observation,
    updated_at = timezone('utc', now());

  delete from
    public.physical_education_attendance_records
  where attendance_session_id = v_session_id
    and teacher_id = v_teacher_id
    and not exists (
      select 1
      from jsonb_to_recordset(p_entries) as entry_row(
        student_id uuid,
        status text,
        observation text
      )
      where entry_row.student_id =
        physical_education_attendance_records.student_id
    );

  return v_session_id;
end;
$function$;

revoke all on function
  public.save_physical_education_attendance(
    uuid,
    date,
    text,
    jsonb
  )
from public, anon;

grant execute on function
  public.save_physical_education_attendance(
    uuid,
    date,
    text,
    jsonb
  )
to authenticated;

comment on function
  public.save_physical_education_attendance(
    uuid,
    date,
    text,
    jsonb
  )
is
  'Guarda atómicamente la asistencia de un curso y valida su propiedad.';
