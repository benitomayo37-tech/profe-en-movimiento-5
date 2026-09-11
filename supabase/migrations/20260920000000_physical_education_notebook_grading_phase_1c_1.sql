-- Profe en Movimiento 5.0
-- Cuaderno Digital de Educación Física
-- Fase 1C-1: estructura normativa de calificaciones.

create table if not exists
  public.physical_education_grading_settings (
    id uuid primary key default gen_random_uuid(),

    teacher_id uuid not null
      default auth.uid()
      references auth.users(id)
      on delete cascade,

    course_id uuid not null,

    formative_weight numeric(5, 4) not null
      default 0.7000
      check (formative_weight >= 0 and formative_weight <= 1),

    project_weight numeric(5, 4) not null
      default 0.1500
      check (project_weight >= 0 and project_weight <= 1),

    exam_weight numeric(5, 4) not null
      default 0.1500
      check (exam_weight >= 0 and exam_weight <= 1),

    cognitive_weight numeric(5, 4) not null
      default 0.3400
      check (cognitive_weight >= 0 and cognitive_weight <= 1),

    affective_social_weight numeric(5, 4) not null
      default 0.3300
      check (
        affective_social_weight >= 0
        and affective_social_weight <= 1
      ),

    motor_weight numeric(5, 4) not null
      default 0.3300
      check (motor_weight >= 0 and motor_weight <= 1),

    created_at timestamptz not null
      default timezone('utc', now()),

    updated_at timestamptz not null
      default timezone('utc', now()),

    constraint
      physical_education_grading_settings_course_owner_fk
      foreign key (course_id, teacher_id)
      references public.physical_education_courses (
        id,
        teacher_id
      )
      on delete cascade,

    constraint
      physical_education_grading_settings_course_key
      unique (course_id),

    constraint
      physical_education_grading_settings_final_weights_check
      check (
        formative_weight
        + project_weight
        + exam_weight
        = 1.0000
      ),

    constraint
      physical_education_grading_settings_dimension_weights_check
      check (
        cognitive_weight
        + affective_social_weight
        + motor_weight
        = 1.0000
      )
  );


create table if not exists
  public.physical_education_grading_periods (
    id uuid primary key default gen_random_uuid(),

    teacher_id uuid not null
      default auth.uid()
      references auth.users(id)
      on delete cascade,

    course_id uuid not null,

    period_number smallint not null
      check (period_number between 1 and 3),

    name text not null
      check (char_length(btrim(name)) between 3 and 40),

    start_date date,

    end_date date,

    status text not null
      default 'open'
      check (status in ('draft', 'open', 'closed')),

    created_at timestamptz not null
      default timezone('utc', now()),

    updated_at timestamptz not null
      default timezone('utc', now()),

    constraint
      physical_education_grading_periods_course_owner_fk
      foreign key (course_id, teacher_id)
      references public.physical_education_courses (
        id,
        teacher_id
      )
      on delete cascade,

    constraint
      physical_education_grading_periods_course_number_key
      unique (course_id, period_number),

    constraint
      physical_education_grading_periods_dates_check
      check (
        start_date is null
        or end_date is null
        or start_date <= end_date
      ),

    unique (id, course_id, teacher_id)
  );


create table if not exists
  public.physical_education_grading_activities (
    id uuid primary key default gen_random_uuid(),

    teacher_id uuid not null
      default auth.uid()
      references auth.users(id)
      on delete cascade,

    course_id uuid not null,

    grading_period_id uuid not null,

    name text not null
      check (char_length(btrim(name)) between 2 and 120),

    activity_date date,

    component text not null
      check (
        component in (
          'formative',
          'interdisciplinary_project',
          'exam'
        )
      ),

    dimension text
      check (
        dimension is null
        or dimension in (
          'cognitive',
          'affective_social',
          'motor'
        )
      ),

    modality text
      check (
        modality is null
        or modality in (
          'individual',
          'group',
          'mixed'
        )
      ),

    instrument text
      check (
        instrument is null
        or char_length(btrim(instrument)) between 2 and 100
      ),

    max_score numeric(4, 2) not null
      default 10.00
      check (max_score > 0 and max_score <= 10.00),

    display_order integer not null
      default 0
      check (display_order >= 0),

    notes text
      check (
        notes is null
        or char_length(btrim(notes)) between 1 and 500
      ),

    active boolean not null default true,

    created_at timestamptz not null
      default timezone('utc', now()),

    updated_at timestamptz not null
      default timezone('utc', now()),

    constraint
      physical_education_grading_activities_course_owner_fk
      foreign key (course_id, teacher_id)
      references public.physical_education_courses (
        id,
        teacher_id
      )
      on delete cascade,

    constraint
      physical_education_grading_activities_period_owner_fk
      foreign key (
        grading_period_id,
        course_id,
        teacher_id
      )
      references public.physical_education_grading_periods (
        id,
        course_id,
        teacher_id
      )
      on delete cascade,

    constraint
      physical_education_grading_activities_component_dimension_check
      check (
        (
          component = 'formative'
          and dimension is not null
          and modality is not null
        )
        or (
          component in (
            'interdisciplinary_project',
            'exam'
          )
          and dimension is null
        )
      ),

    unique (id, course_id, teacher_id)
  );


create unique index if not exists
  physical_education_grading_activities_project_key
on public.physical_education_grading_activities (
  grading_period_id
)
where component = 'interdisciplinary_project'
  and active = true;


create unique index if not exists
  physical_education_grading_activities_exam_key
on public.physical_education_grading_activities (
  grading_period_id
)
where component = 'exam'
  and active = true;


create index if not exists
  physical_education_grading_activities_period_order_idx
on public.physical_education_grading_activities (
  grading_period_id,
  active,
  display_order,
  activity_date
);


create table if not exists
  public.physical_education_grades (
    id uuid primary key default gen_random_uuid(),

    teacher_id uuid not null
      default auth.uid()
      references auth.users(id)
      on delete cascade,

    course_id uuid not null,

    grading_activity_id uuid not null,

    student_id uuid not null,

    score numeric(4, 2),

    status text not null
      default 'pending'
      check (
        status in (
          'graded',
          'pending',
          'not_evaluated',
          'excused'
        )
      ),

    observation text
      check (
        observation is null
        or char_length(btrim(observation)) between 1 and 500
      ),

    created_at timestamptz not null
      default timezone('utc', now()),

    updated_at timestamptz not null
      default timezone('utc', now()),

    constraint
      physical_education_grades_activity_owner_fk
      foreign key (
        grading_activity_id,
        course_id,
        teacher_id
      )
      references public.physical_education_grading_activities (
        id,
        course_id,
        teacher_id
      )
      on delete cascade,

    constraint
      physical_education_grades_student_owner_fk
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
      physical_education_grades_activity_student_key
      unique (grading_activity_id, student_id),

    constraint
      physical_education_grades_score_status_check
      check (
        (
          status = 'graded'
          and score is not null
          and score between 1.00 and 10.00
        )
        or (
          status <> 'graded'
          and score is null
        )
      )
  );


create index if not exists
  physical_education_grades_course_student_idx
on public.physical_education_grades (
  course_id,
  student_id
);


create index if not exists
  physical_education_grades_activity_status_idx
on public.physical_education_grades (
  grading_activity_id,
  status
);


drop trigger if exists
  physical_education_grading_settings_updated_at
on public.physical_education_grading_settings;

create trigger
  physical_education_grading_settings_updated_at
before update
on public.physical_education_grading_settings
for each row
execute function
  public.set_physical_education_notebook_updated_at();


drop trigger if exists
  physical_education_grading_periods_updated_at
on public.physical_education_grading_periods;

create trigger
  physical_education_grading_periods_updated_at
before update
on public.physical_education_grading_periods
for each row
execute function
  public.set_physical_education_notebook_updated_at();


drop trigger if exists
  physical_education_grading_activities_updated_at
on public.physical_education_grading_activities;

create trigger
  physical_education_grading_activities_updated_at
before update
on public.physical_education_grading_activities
for each row
execute function
  public.set_physical_education_notebook_updated_at();


drop trigger if exists
  physical_education_grades_updated_at
on public.physical_education_grades;

create trigger
  physical_education_grades_updated_at
before update
on public.physical_education_grades
for each row
execute function
  public.set_physical_education_notebook_updated_at();


insert into public.physical_education_grading_settings (
  teacher_id,
  course_id
)
select
  course_row.teacher_id,
  course_row.id
from public.physical_education_courses as course_row
on conflict (course_id)
do nothing;


insert into public.physical_education_grading_periods (
  teacher_id,
  course_id,
  period_number,
  name
)
select
  course_row.teacher_id,
  course_row.id,
  period_row.period_number,
  period_row.name
from public.physical_education_courses as course_row
cross join (
  values
    (1::smallint, 'Primer trimestre'::text),
    (2::smallint, 'Segundo trimestre'::text),
    (3::smallint, 'Tercer trimestre'::text)
) as period_row(period_number, name)
on conflict (course_id, period_number)
do nothing;


alter table
  public.physical_education_grading_settings
enable row level security;

alter table
  public.physical_education_grading_periods
enable row level security;

alter table
  public.physical_education_grading_activities
enable row level security;

alter table
  public.physical_education_grades
enable row level security;


revoke all
on public.physical_education_grading_settings
from public, anon;

revoke all
on public.physical_education_grading_periods
from public, anon;

revoke all
on public.physical_education_grading_activities
from public, anon;

revoke all
on public.physical_education_grades
from public, anon;


grant select, insert, update, delete
on public.physical_education_grading_settings
to authenticated;

grant select, insert, update, delete
on public.physical_education_grading_periods
to authenticated;

grant select, insert, update, delete
on public.physical_education_grading_activities
to authenticated;

grant select, insert, update, delete
on public.physical_education_grades
to authenticated;


create policy
  "physical_education_grading_settings_select_own"
on public.physical_education_grading_settings
for select
to authenticated
using (
  teacher_id = (select auth.uid())
);

create policy
  "physical_education_grading_settings_insert_own"
on public.physical_education_grading_settings
for insert
to authenticated
with check (
  teacher_id = (select auth.uid())
);

create policy
  "physical_education_grading_settings_update_own"
on public.physical_education_grading_settings
for update
to authenticated
using (
  teacher_id = (select auth.uid())
)
with check (
  teacher_id = (select auth.uid())
);

create policy
  "physical_education_grading_settings_delete_own"
on public.physical_education_grading_settings
for delete
to authenticated
using (
  teacher_id = (select auth.uid())
);


create policy
  "physical_education_grading_periods_select_own"
on public.physical_education_grading_periods
for select
to authenticated
using (
  teacher_id = (select auth.uid())
);

create policy
  "physical_education_grading_periods_insert_own"
on public.physical_education_grading_periods
for insert
to authenticated
with check (
  teacher_id = (select auth.uid())
);

create policy
  "physical_education_grading_periods_update_own"
on public.physical_education_grading_periods
for update
to authenticated
using (
  teacher_id = (select auth.uid())
)
with check (
  teacher_id = (select auth.uid())
);

create policy
  "physical_education_grading_periods_delete_own"
on public.physical_education_grading_periods
for delete
to authenticated
using (
  teacher_id = (select auth.uid())
);


create policy
  "physical_education_grading_activities_select_own"
on public.physical_education_grading_activities
for select
to authenticated
using (
  teacher_id = (select auth.uid())
);

create policy
  "physical_education_grading_activities_insert_own"
on public.physical_education_grading_activities
for insert
to authenticated
with check (
  teacher_id = (select auth.uid())
);

create policy
  "physical_education_grading_activities_update_own"
on public.physical_education_grading_activities
for update
to authenticated
using (
  teacher_id = (select auth.uid())
)
with check (
  teacher_id = (select auth.uid())
);

create policy
  "physical_education_grading_activities_delete_own"
on public.physical_education_grading_activities
for delete
to authenticated
using (
  teacher_id = (select auth.uid())
);


create policy
  "physical_education_grades_select_own"
on public.physical_education_grades
for select
to authenticated
using (
  teacher_id = (select auth.uid())
);

create policy
  "physical_education_grades_insert_own"
on public.physical_education_grades
for insert
to authenticated
with check (
  teacher_id = (select auth.uid())
);

create policy
  "physical_education_grades_update_own"
on public.physical_education_grades
for update
to authenticated
using (
  teacher_id = (select auth.uid())
)
with check (
  teacher_id = (select auth.uid())
);

create policy
  "physical_education_grades_delete_own"
on public.physical_education_grades
for delete
to authenticated
using (
  teacher_id = (select auth.uid())
);


comment on table
  public.physical_education_grading_settings
is
  'Configuración normativa de evaluación por curso.';

comment on table
  public.physical_education_grading_periods
is
  'Trimestres de evaluación de cada curso.';

comment on table
  public.physical_education_grading_activities
is
  'Actividades formativas, proyecto interdisciplinario y examen.';

comment on table
  public.physical_education_grades
is
  'Calificaciones y estados de evaluación por estudiante.';


notify pgrst, 'reload schema';
