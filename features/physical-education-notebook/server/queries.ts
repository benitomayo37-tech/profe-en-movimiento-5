import "server-only";

import { createClient } from "@/lib/supabase/server";

import type {
  NotebookActionResult,
  PhysicalEducationCourse,
  PhysicalEducationStudent,
  StudentStatus,
} from "../types";

type CourseRow = {
  id: string;
  teacher_id: string;
  name: string;
  education_level: string;
  grade: string;
  parallel: string;
  school_year: string;
  shift: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

type StudentRow = {
  id: string;
  teacher_id: string;
  course_id: string;
  first_names: string;
  last_names: string;
  student_code: string | null;
  list_number: number | null;
  status: StudentStatus;
  created_at: string;
  updated_at: string;
};

function mapCourse(
  row: CourseRow,
  studentCount: number,
): PhysicalEducationCourse {
  return {
    id: row.id,
    teacherId: row.teacher_id,
    name: row.name,
    educationLevel: row.education_level,
    grade: row.grade,
    parallel: row.parallel,
    schoolYear: row.school_year,
    shift: row.shift,
    active: row.active,
    studentCount,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapStudent(
  row: StudentRow,
): PhysicalEducationStudent {
  return {
    id: row.id,
    teacherId: row.teacher_id,
    courseId: row.course_id,
    firstNames: row.first_names,
    lastNames: row.last_names,
    studentCode: row.student_code,
    listNumber: row.list_number,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getAuthenticatedClient() {
  const supabase = await createClient();

  if (!supabase) {
    return {
      supabase: null,
      userId: null,
    };
  }

  const { data, error } =
    await supabase.auth.getClaims();

  const userId =
    typeof data?.claims?.sub === "string"
      ? data.claims.sub
      : null;

  if (error || !userId) {
    return {
      supabase: null,
      userId: null,
    };
  }

  return {
    supabase,
    userId,
  };
}

export async function getCourses():
  Promise<
    NotebookActionResult<PhysicalEducationCourse[]>
  > {
  const { supabase, userId } =
    await getAuthenticatedClient();

  if (!supabase || !userId) {
    return {
      success: false,
      message: "Debes iniciar sesión.",
      data: [],
    };
  }

  const { data: courseRows, error: courseError } =
    await supabase
      .from("physical_education_courses")
      .select(
        "id, teacher_id, name, education_level, grade, parallel, school_year, shift, active, created_at, updated_at",
      )
      .eq("teacher_id", userId)
      .order("active", { ascending: false })
      .order("school_year", { ascending: false })
      .order("grade", { ascending: true })
      .order("parallel", { ascending: true });

  if (courseError) {
    console.error(
      "No se pudieron consultar los cursos:",
      courseError,
    );

    return {
      success: false,
      message: "No pudimos cargar tus cursos.",
      data: [],
    };
  }

  const courses = (courseRows ?? []) as CourseRow[];
  const courseIds = courses.map((course) => course.id);

  const studentCountByCourse = new Map<
    string,
    number
  >();

  if (courseIds.length) {
    const { data: studentRows, error: studentError } =
      await supabase
        .from("physical_education_students")
        .select("course_id")
        .eq("teacher_id", userId)
        .eq("status", "active")
        .in("course_id", courseIds);

    if (studentError) {
      console.error(
        "No se pudo calcular el total de estudiantes:",
        studentError,
      );
    } else {
      for (const row of studentRows ?? []) {
        const courseId = String(row.course_id);

        studentCountByCourse.set(
          courseId,
          (studentCountByCourse.get(courseId) ?? 0)
            + 1,
        );
      }
    }
  }

  return {
    success: true,
    message: "Cursos cargados correctamente.",
    data: courses.map((course) =>
      mapCourse(
        course,
        studentCountByCourse.get(course.id) ?? 0,
      ),
    ),
  };
}

export async function getStudentsByCourse(
  courseId: string,
): Promise<
  NotebookActionResult<PhysicalEducationStudent[]>
> {
  const { supabase, userId } =
    await getAuthenticatedClient();

  if (!supabase || !userId) {
    return {
      success: false,
      message: "Debes iniciar sesión.",
      data: [],
    };
  }

  const { data: course, error: courseError } =
    await supabase
      .from("physical_education_courses")
      .select("id")
      .eq("id", courseId)
      .eq("teacher_id", userId)
      .maybeSingle();

  if (courseError || !course) {
    return {
      success: false,
      message:
        "El curso no existe o no tienes acceso.",
      data: [],
    };
  }

  const { data, error } = await supabase
    .from("physical_education_students")
    .select(
      "id, teacher_id, course_id, first_names, last_names, student_code, list_number, status, created_at, updated_at",
    )
    .eq("teacher_id", userId)
    .eq("course_id", courseId)
    .order("status", { ascending: true })
    .order("list_number", {
      ascending: true,
      nullsFirst: false,
    })
    .order("last_names", { ascending: true })
    .order("first_names", { ascending: true });

  if (error) {
    console.error(
      "No se pudieron consultar los estudiantes:",
      error,
    );

    return {
      success: false,
      message:
        "No pudimos cargar los estudiantes.",
      data: [],
    };
  }

  return {
    success: true,
    message: "Estudiantes cargados correctamente.",
    data: ((data ?? []) as StudentRow[]).map(
      mapStudent,
    ),
  };
}
