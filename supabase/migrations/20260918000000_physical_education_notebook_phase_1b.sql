-- Profe en Movimiento 5.0
-- Cuaderno Digital de Educación Física
-- Fase 1B: asistencia por fecha y observaciones rápidas.

create unique index if not exists
  physical_education_students_record_owner_idx
on public.physical_education_students (
  id,
  course_id,
  teacher_id
);


create table if not exists
  public.physical_education_attendance_sessions (
    id uuid primary key default gen_random_uuid(),

    teacher_id uuid not null
      default auth.uid()
      references auth.users(id)
      on delete cascade,

    course_id uuid not null,

    attendance_date date not null
      default current_date,

    class_note text
      check (
        class_note is null
        or char_length(btrim(class_note))
          between 1 and 500
      ),

    created_at timestamptz not null
      default timezone('utc', now()),

    updated_at timestamptz not null
      default timezone('utc', now()),

    constraint
      physical_education_attendance_sessions_course_owner_fk
      foreign key (course_id, teacher_id)
      references public.physical_education_courses (
        id,
        teacher_id
      )
      on delete cascade,

    unique (id, course_id, teacher_id),

    constraint
      physical_education_attendance_sessions_course_date_key
      unique (course_id, attendance_date)
  );

create index if not exists
  physical_education_attendance_sessions_teacher_date_idx
on public.physical_education_attendance_sessions (
  teacher_id,
  attendance_date desc
);

create index if not exists
  physical_education_attendance_sessions_course_owner_idx
on public.physical_education_attendance_sessions (
  course_id,
  teacher_id
);


create table if not exists
  public.physical_education_attendance_records (
    id uuid primary key default gen_random_uuid(),

    teacher_id uuid not null
      default auth.uid()
      references auth.users(id)
      on delete cascade,

    attendance_session_id uuid not null,

    course_id uuid not null,

    student_id uuid not null,

    status text not null
      default 'present'
      check (
        status in (
          'present',
          'absent',
          'late',
          'excused'
        )
      ),

    observation text
      check (
        observation is null
        or char_length(btrim(observation))
          between 1 and 500
      ),

    created_at timestamptz not null
      default timezone('utc', now()),

    updated_at timestamptz not null
      default timezone('utc', now()),

    constraint
      physical_education_attendance_records_session_owner_fk
      foreign key (
        attendance_session_id,
        course_id,
        teacher_id
      )
      references
        public.physical_education_attendance_sessions (
          id,
          course_id,
          teacher_id
        )
      on delete cascade,

    constraint
      physical_education_attendance_records_student_owner_fk
      foreign key (
        student_id,
        course_id,
        teacher_id
      )
      references public.physical_education_students (
        id,
        course_id,
        teacher_id
      )
      on delete cascade,

    constraint
      physical_education_attendance_records_session_student_key
      unique (
        attendance_session_id,
        student_id
      )
  );

create index if not exists
  physical_education_attendance_records_teacher_course_idx
on public.physical_education_attendance_records (
  teacher_id,
  course_id
);

create index if not exists
  physical_education_attendance_records_session_owner_idx
on public.physical_education_attendance_records (
  attendance_session_id,
  course_id,
  teacher_id
);

create index if not exists
  physical_education_attendance_records_student_owner_idx
on public.physical_education_attendance_records (
  student_id,
  course_id,
  teacher_id
);

create index if not exists
  physical_education_attendance_records_course_status_idx
on public.physical_education_attendance_records (
  course_id,
  status
);


drop trigger if exists
  physical_education_attendance_sessions_updated_at
on public.physical_education_attendance_sessions;

create trigger
  physical_education_attendance_sessions_updated_at
before update
on public.physical_education_attendance_sessions
for each row
execute function
  public.set_physical_education_notebook_updated_at();


drop trigger if exists
  physical_education_attendance_records_updated_at
on public.physical_education_attendance_records;

create trigger
  physical_education_attendance_records_updated_at
before update
on public.physical_education_attendance_records
for each row
execute function
  public.set_physical_education_notebook_updated_at();


alter table
  public.physical_education_attendance_sessions
  enable row level security;

alter table
  public.physical_education_attendance_records
  enable row level security;


revoke all
on public.physical_education_attendance_sessions
from public, anon, authenticated;

revoke all
on public.physical_education_attendance_records
from public, anon, authenticated;

grant select, insert, update, delete
on public.physical_education_attendance_sessions
to authenticated;

grant select, insert, update, delete
on public.physical_education_attendance_records
to authenticated;


drop policy if exists
  "physical_education_attendance_sessions_select_own"
on public.physical_education_attendance_sessions;

create policy
  "physical_education_attendance_sessions_select_own"
on public.physical_education_attendance_sessions
for select
to authenticated
using (
  teacher_id = (select auth.uid())
);


drop policy if exists
  "physical_education_attendance_sessions_insert_own"
on public.physical_education_attendance_sessions;

create policy
  "physical_education_attendance_sessions_insert_own"
on public.physical_education_attendance_sessions
for insert
to authenticated
with check (
  teacher_id = (select auth.uid())
  and exists (
    select 1
    from public.physical_education_courses course
    where course.id = course_id
      and course.teacher_id = (select auth.uid())
  )
);


drop policy if exists
  "physical_education_attendance_sessions_update_own"
on public.physical_education_attendance_sessions;

create policy
  "physical_education_attendance_sessions_update_own"
on public.physical_education_attendance_sessions
for update
to authenticated
using (
  teacher_id = (select auth.uid())
)
with check (
  teacher_id = (select auth.uid())
  and exists (
    select 1
    from public.physical_education_courses course
    where course.id = course_id
      and course.teacher_id = (select auth.uid())
  )
);


drop policy if exists
  "physical_education_attendance_sessions_delete_own"
on public.physical_education_attendance_sessions;

create policy
  "physical_education_attendance_sessions_delete_own"
on public.physical_education_attendance_sessions
for delete
to authenticated
using (
  teacher_id = (select auth.uid())
);


drop policy if exists
  "physical_education_attendance_records_select_own"
on public.physical_education_attendance_records;

create policy
  "physical_education_attendance_records_select_own"
on public.physical_education_attendance_records
for select
to authenticated
using (
  teacher_id = (select auth.uid())
);


drop policy if exists
  "physical_education_attendance_records_insert_own"
on public.physical_education_attendance_records;

create policy
  "physical_education_attendance_records_insert_own"
on public.physical_education_attendance_records
for insert
to authenticated
with check (
  teacher_id = (select auth.uid())
  and exists (
    select 1
    from public.physical_education_attendance_sessions session
    where session.id = attendance_session_id
      and session.course_id = course_id
      and session.teacher_id = (select auth.uid())
  )
  and exists (
    select 1
    from public.physical_education_students student
    where student.id = student_id
      and student.course_id = course_id
      and student.teacher_id = (select auth.uid())
  )
);


drop policy if exists
  "physical_education_attendance_records_update_own"
on public.physical_education_attendance_records;

create policy
  "physical_education_attendance_records_update_own"
on public.physical_education_attendance_records
for update
to authenticated
using (
  teacher_id = (select auth.uid())
)
with check (
  teacher_id = (select auth.uid())
  and exists (
    select 1
    from public.physical_education_attendance_sessions session
    where session.id = attendance_session_id
      and session.course_id = course_id
      and session.teacher_id = (select auth.uid())
  )
  and exists (
    select 1
    from public.physical_education_students student
    where student.id = student_id
      and student.course_id = course_id
      and student.teacher_id = (select auth.uid())
  )
);


drop policy if exists
  "physical_education_attendance_records_delete_own"
on public.physical_education_attendance_records;

create policy
  "physical_education_attendance_records_delete_own"
on public.physical_education_attendance_records
for delete
to authenticated
using (
  teacher_id = (select auth.uid())
);

notify pgrst, 'reload schema';
