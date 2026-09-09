-- Profe en Movimiento 5.0
-- Cuaderno Digital de Educación Física
-- Fase 1A: cursos y administración de estudiantes.

create extension if not exists pgcrypto;

create table if not exists public.physical_education_courses (
  id uuid primary key default gen_random_uuid(),

  teacher_id uuid not null
    default auth.uid()
    references auth.users(id)
    on delete cascade,

  name text not null
    check (char_length(btrim(name)) between 2 and 120),

  education_level text not null
    check (char_length(btrim(education_level)) between 2 and 80),

  grade text not null
    check (char_length(btrim(grade)) between 1 and 80),

  parallel text not null
    check (char_length(btrim(parallel)) between 1 and 20),

  school_year text not null
    check (char_length(btrim(school_year)) between 4 and 20),

  shift text
    check (
      shift is null
      or char_length(btrim(shift)) between 2 and 40
    ),

  active boolean not null default true,

  created_at timestamptz not null
    default timezone('utc', now()),

  updated_at timestamptz not null
    default timezone('utc', now()),

  unique (id, teacher_id)
);

create unique index if not exists
  physical_education_courses_identity_idx
on public.physical_education_courses (
  teacher_id,
  lower(btrim(education_level)),
  lower(btrim(grade)),
  lower(btrim(parallel)),
  lower(btrim(school_year))
);

create index if not exists
  physical_education_courses_teacher_active_idx
on public.physical_education_courses (
  teacher_id,
  active,
  school_year
);


create table if not exists public.physical_education_students (
  id uuid primary key default gen_random_uuid(),

  teacher_id uuid not null
    default auth.uid()
    references auth.users(id)
    on delete cascade,

  course_id uuid not null,

  first_names text not null
    check (char_length(btrim(first_names)) between 1 and 100),

  last_names text not null
    check (char_length(btrim(last_names)) between 1 and 100),

  student_code text
    check (
      student_code is null
      or char_length(btrim(student_code)) between 1 and 50
    ),

  list_number integer
    check (list_number is null or list_number between 1 and 999),

  status text not null default 'active'
    check (status in ('active', 'inactive', 'withdrawn')),

  created_at timestamptz not null
    default timezone('utc', now()),

  updated_at timestamptz not null
    default timezone('utc', now()),

  constraint physical_education_students_course_owner_fk
    foreign key (course_id, teacher_id)
    references public.physical_education_courses (id, teacher_id)
    on delete cascade
);

create index if not exists
  physical_education_students_course_name_idx
on public.physical_education_students (
  course_id,
  last_names,
  first_names
);

create index if not exists
  physical_education_students_teacher_status_idx
on public.physical_education_students (
  teacher_id,
  status
);

create unique index if not exists
  physical_education_students_code_idx
on public.physical_education_students (
  teacher_id,
  course_id,
  lower(btrim(student_code))
)
where student_code is not null
  and btrim(student_code) <> '';

create unique index if not exists
  physical_education_students_list_number_idx
on public.physical_education_students (
  course_id,
  list_number
)
where list_number is not null;


create or replace function
  public.set_physical_education_notebook_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists
  physical_education_courses_updated_at
on public.physical_education_courses;

create trigger physical_education_courses_updated_at
before update on public.physical_education_courses
for each row
execute function
  public.set_physical_education_notebook_updated_at();

drop trigger if exists
  physical_education_students_updated_at
on public.physical_education_students;

create trigger physical_education_students_updated_at
before update on public.physical_education_students
for each row
execute function
  public.set_physical_education_notebook_updated_at();


alter table public.physical_education_courses
  enable row level security;

alter table public.physical_education_students
  enable row level security;

revoke all on public.physical_education_courses
  from public, anon;

revoke all on public.physical_education_students
  from public, anon;

grant select, insert, update, delete
  on public.physical_education_courses
  to authenticated;

grant select, insert, update, delete
  on public.physical_education_students
  to authenticated;


drop policy if exists
  "physical_education_courses_select_own"
on public.physical_education_courses;

create policy "physical_education_courses_select_own"
on public.physical_education_courses
for select
to authenticated
using (
  teacher_id = (select auth.uid())
);


drop policy if exists
  "physical_education_courses_insert_own"
on public.physical_education_courses;

create policy "physical_education_courses_insert_own"
on public.physical_education_courses
for insert
to authenticated
with check (
  teacher_id = (select auth.uid())
);


drop policy if exists
  "physical_education_courses_update_own"
on public.physical_education_courses;

create policy "physical_education_courses_update_own"
on public.physical_education_courses
for update
to authenticated
using (
  teacher_id = (select auth.uid())
)
with check (
  teacher_id = (select auth.uid())
);


drop policy if exists
  "physical_education_courses_delete_own"
on public.physical_education_courses;

create policy "physical_education_courses_delete_own"
on public.physical_education_courses
for delete
to authenticated
using (
  teacher_id = (select auth.uid())
);


drop policy if exists
  "physical_education_students_select_own"
on public.physical_education_students;

create policy "physical_education_students_select_own"
on public.physical_education_students
for select
to authenticated
using (
  teacher_id = (select auth.uid())
);


drop policy if exists
  "physical_education_students_insert_own"
on public.physical_education_students;

create policy "physical_education_students_insert_own"
on public.physical_education_students
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
  "physical_education_students_update_own"
on public.physical_education_students;

create policy "physical_education_students_update_own"
on public.physical_education_students
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
  "physical_education_students_delete_own"
on public.physical_education_students;

create policy "physical_education_students_delete_own"
on public.physical_education_students
for delete
to authenticated
using (
  teacher_id = (select auth.uid())
);

revoke all on function
  public.set_physical_education_notebook_updated_at()
from public, anon, authenticated;

notify pgrst, 'reload schema';
