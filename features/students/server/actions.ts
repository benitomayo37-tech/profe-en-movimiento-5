"use server";

import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { clearStudentSession, setStudentSession } from "@/features/students/server/session";
import type { StudentActionState } from "@/features/students/types";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function validPin(pin: string) {
  return /^\d{4}$/.test(pin);
}

function configurationError(): StudentActionState {
  return {
    status: "error",
    message: "El acceso estudiantil aún no está configurado. Comunícalo al administrador.",
  };
}

export async function studentSignInAction(
  _previousState: StudentActionState,
  formData: FormData,
): Promise<StudentActionState> {
  const fullName = value(formData, "fullName");
  const pin = value(formData, "pin");
  const fieldErrors: StudentActionState["fieldErrors"] = {};

  if (fullName.length < 5) fieldErrors.fullName = "Escribe tu nombre completo.";
  if (!validPin(pin)) fieldErrors.pin = "El PIN debe tener exactamente 4 números.";
  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Revisa los datos ingresados.", fieldErrors };
  }

  const admin = createAdminClient();
  if (!admin) return configurationError();

  const { data, error } = await admin.rpc("verify_student_account", {
    p_full_name: fullName,
    p_pin: pin,
  });
  const student = Array.isArray(data) ? data[0] : null;

  if (error || !student) {
    return { status: "error", message: "No pudimos ingresar. Revisa tu nombre completo y tu PIN." };
  }

  await setStudentSession({
    studentId: student.id,
    fullName: student.full_name,
    institution: student.institution,
    educationLevel: student.education_level,
    gradeCourse: student.grade_course,
  });

  redirect("/estudiantes");
}

export async function studentQuickAccessAction(
  _previousState: StudentActionState,
  formData: FormData,
): Promise<StudentActionState> {
  const displayName = value(formData, "displayName");
  const educationLevel = value(formData, "educationLevel");
  const gradeCourse = value(formData, "gradeCourse");
  const fieldErrors: StudentActionState["fieldErrors"] = {};

  if (displayName.length < 2 || displayName.length > 40) {
    fieldErrors.displayName = "Escribe tu nombre o un apodo de 2 a 40 caracteres.";
  }
  if (!educationLevel) fieldErrors.educationLevel = "Selecciona tu nivel educativo.";
  if (!gradeCourse || gradeCourse.length > 80) fieldErrors.gradeCourse = "Escribe tu grado o curso.";

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Revisa los datos ingresados.", fieldErrors };
  }

  const admin = createAdminClient();
  if (!admin) return configurationError();

  const { data: studentId, error } = await admin.rpc("create_quick_student_profile", {
    p_display_name: displayName,
    p_education_level: educationLevel,
    p_grade_course: gradeCourse,
  });

  if (error || typeof studentId !== "string") {
    console.error("[Acceso estudiantil rápido] No se pudo crear el perfil:", error);
    return {
      status: "error",
      message: "No pudimos preparar tu espacio gratuito. Inténtalo nuevamente.",
    };
  }

  await setStudentSession({
    studentId,
    fullName: displayName,
    institution: "Acceso gratuito",
    educationLevel,
    gradeCourse,
  });

  redirect("/estudiantes");
}

export async function studentSignUpAction(
  _previousState: StudentActionState,
  formData: FormData,
): Promise<StudentActionState> {
  const fullName = value(formData, "fullName");
  const institution = value(formData, "institution");
  const educationLevel = value(formData, "educationLevel");
  const gradeCourse = value(formData, "gradeCourse");
  const pin = value(formData, "pin");
  const confirmPin = value(formData, "confirmPin");
  const fieldErrors: StudentActionState["fieldErrors"] = {};

  if (fullName.length < 5 || fullName.length > 120) fieldErrors.fullName = "Escribe tu nombre completo.";
  if (institution.length < 2 || institution.length > 160) fieldErrors.institution = "Escribe el nombre de tu Unidad Educativa.";
  if (!educationLevel) fieldErrors.educationLevel = "Selecciona tu nivel educativo.";
  if (!gradeCourse) fieldErrors.gradeCourse = "Escribe tu grado, curso y paralelo.";
  if (!validPin(pin)) fieldErrors.pin = "Crea un PIN de exactamente 4 números.";
  if (pin !== confirmPin) fieldErrors.confirmPin = "Los PIN no coinciden.";

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Revisa los datos ingresados.", fieldErrors };
  }

  const admin = createAdminClient();
  if (!admin) return configurationError();

  const { data: studentId, error } = await admin.rpc("create_student_account", {
    p_full_name: fullName,
    p_institution: institution,
    p_education_level: educationLevel,
    p_grade_course: gradeCourse,
    p_pin: pin,
  });

  if (error || typeof studentId !== "string") {
    const duplicate = error?.message.includes("student_credentials_exist");
    return {
      status: "error",
      message: duplicate
        ? "Ya existe un acceso con ese nombre y PIN. Inicia sesión o elige otro PIN personal."
        : "No pudimos crear tu acceso. Inténtalo nuevamente.",
    };
  }

  await setStudentSession({
    studentId,
    fullName,
    institution,
    educationLevel,
    gradeCourse,
  });

  redirect("/estudiantes");
}

export async function studentSignOutAction() {
  await clearStudentSession();
  redirect("/login?rol=estudiante");
}
