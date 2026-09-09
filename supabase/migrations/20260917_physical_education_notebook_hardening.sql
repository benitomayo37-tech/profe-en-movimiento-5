-- Cuaderno Digital de Educación Física
-- Endurecimiento de permisos e índice de clave foránea.

create index if not exists
  physical_education_students_course_owner_idx
on public.physical_education_students (
  course_id,
  teacher_id
);

revoke all on public.physical_education_courses
  from authenticated;

revoke all on public.physical_education_students
  from authenticated;

grant select, insert, update, delete
  on public.physical_education_courses
  to authenticated;

grant select, insert, update, delete
  on public.physical_education_students
  to authenticated;

notify pgrst, 'reload schema';
