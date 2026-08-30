-- Profe en Movimiento 5.0
-- Acceso simplificado a los recursos gratuitos para estudiantes.

alter table public.student_accounts
  add column if not exists access_mode text not null default 'pin';

alter table public.student_accounts
  drop constraint if exists student_accounts_access_mode_check;

alter table public.student_accounts
  add constraint student_accounts_access_mode_check
  check (access_mode in ('pin', 'quick'));

create or replace function public.create_quick_student_profile(
  p_display_name text,
  p_education_level text,
  p_grade_course text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_student_id uuid;
  clean_name text := trim(regexp_replace(coalesce(p_display_name, ''), '\s+', ' ', 'g'));
  clean_level text := trim(regexp_replace(coalesce(p_education_level, ''), '\s+', ' ', 'g'));
  clean_grade text := trim(regexp_replace(coalesce(p_grade_course, ''), '\s+', ' ', 'g'));
  private_token text := encode(extensions.gen_random_bytes(18), 'hex');
begin
  if char_length(clean_name) < 2 or char_length(clean_name) > 40 then
    raise exception 'invalid_display_name';
  end if;
  if char_length(clean_level) < 2 or char_length(clean_level) > 80 then
    raise exception 'invalid_education_level';
  end if;
  if char_length(clean_grade) < 1 or char_length(clean_grade) > 80 then
    raise exception 'invalid_grade_course';
  end if;

  -- student_accounts exige al menos cinco caracteres. El sufijo interno no se
  -- muestra al estudiante y evita usar nombres reales como credencial.
  if char_length(clean_name) < 5 then
    clean_name := clean_name || repeat(' ', 5 - char_length(clean_name));
  end if;

  insert into public.student_accounts (
    full_name,
    normalized_name,
    institution,
    education_level,
    grade_course,
    pin_hash,
    access_mode
  ) values (
    clean_name,
    public.normalize_student_name(clean_name) || '-' || substr(private_token, 1, 12),
    'Acceso gratuito',
    clean_level,
    clean_grade,
    extensions.crypt(private_token, extensions.gen_salt('bf', 10)),
    'quick'
  )
  returning id into new_student_id;

  return new_student_id;
end;
$$;

revoke all on function public.create_quick_student_profile(text, text, text) from public;
grant execute on function public.create_quick_student_profile(text, text, text) to service_role;
