create table if not exists public.student_exams (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  access_code text not null unique,
  title text not null check (char_length(title) between 3 and 120),
  topic text not null check (char_length(topic) between 3 and 500),
  institution text not null check (char_length(institution) between 2 and 160),
  grade_course text not null check (char_length(grade_course) between 1 and 80),
  questions jsonb not null,
  active boolean not null default true,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint student_exams_questions_array check (jsonb_typeof(questions) = 'array')
);

create table if not exists public.student_exam_attempts (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.student_exams(id) on delete cascade,
  student_id uuid,
  student_name text not null check (char_length(student_name) between 3 and 160),
  institution text not null check (char_length(institution) between 2 and 160),
  grade_course text not null check (char_length(grade_course) between 1 and 80),
  version_questions jsonb not null,
  answers jsonb,
  score integer check (score between 0 and 10),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  constraint student_exam_attempts_questions_array check (jsonb_typeof(version_questions) = 'array')
);

create index if not exists student_exams_teacher_created_idx
  on public.student_exams (teacher_id, created_at desc);

create index if not exists student_exam_attempts_exam_created_idx
  on public.student_exam_attempts (exam_id, created_at desc);

alter table public.student_exams enable row level security;
alter table public.student_exam_attempts enable row level security;

comment on table public.student_exams is
  'Exámenes creados por docentes. El acceso de la aplicación se realiza mediante rutas de servidor con service role.';

comment on table public.student_exam_attempts is
  'Versiones y resultados de exámenes estudiantiles. No se exponen respuestas correctas al cliente antes del envío.';
