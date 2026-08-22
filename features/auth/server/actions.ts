"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import type { AuthActionState } from "@/features/auth/types";
import { normalizeReturnTo } from "@/features/auth/server/access";
import { createClient } from "@/lib/supabase/server";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string) {
  return password.length >= 8 && /[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(password) && /\d/.test(password);
}

async function getBaseUrl() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host?.includes("localhost") ? "http" : "https");

  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

function configurationError(): AuthActionState {
  return {
    status: "error",
    message: "Supabase todavía no está configurado. Completa primero la guía de instalación.",
  };
}

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = value(formData, "email").toLocaleLowerCase("es");
  const password = value(formData, "password");
  const returnTo = normalizeReturnTo(value(formData, "returnTo"), "/dashboard");
  const fieldErrors: AuthActionState["fieldErrors"] = {};

  if (!validateEmail(email)) fieldErrors.email = "Escribe un correo electrónico válido.";
  if (!password) fieldErrors.password = "Escribe tu contraseña.";

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Revisa los datos ingresados.", fieldErrors };
  }

  const supabase = await createClient();
  if (!supabase) return configurationError();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { status: "error", message: "No pudimos iniciar sesión. Revisa el correo y la contraseña." };
  }

  redirect(returnTo);
}

export async function signUpAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const fullName = value(formData, "fullName");
  const email = value(formData, "email").toLocaleLowerCase("es");
  const password = value(formData, "password");
  const confirmPassword = value(formData, "confirmPassword");
  const fieldErrors: AuthActionState["fieldErrors"] = {};

  if (fullName.length < 2 || fullName.length > 120) {
    fieldErrors.fullName = "Escribe un nombre de entre 2 y 120 caracteres.";
  }
  if (!validateEmail(email)) fieldErrors.email = "Escribe un correo electrónico válido.";
  if (!validatePassword(password)) {
    fieldErrors.password = "Usa al menos 8 caracteres, una letra y un número.";
  }
  if (password !== confirmPassword) fieldErrors.confirmPassword = "Las contraseñas no coinciden.";

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Revisa los datos ingresados.", fieldErrors };
  }

  const supabase = await createClient();
  if (!supabase) return configurationError();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${await getBaseUrl()}/auth/confirm`,
    },
  });

  if (error) {
    return { status: "error", message: "No pudimos crear la cuenta. Inténtalo nuevamente." };
  }

  if (data.session) redirect("/dashboard");

  return {
    status: "success",
    message: "Cuenta registrada. Revisa tu correo y confirma el enlace para iniciar sesión.",
  };
}

export async function requestPasswordResetAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = value(formData, "email").toLocaleLowerCase("es");

  if (!validateEmail(email)) {
    return {
      status: "error",
      message: "Revisa los datos ingresados.",
      fieldErrors: { email: "Escribe un correo electrónico válido." },
    };
  }

  const supabase = await createClient();
  if (!supabase) return configurationError();

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await getBaseUrl()}/auth/confirm?next=/actualizar-contrasena`,
  });

  return {
    status: "success",
    message: "Si existe una cuenta con ese correo, recibirás un enlace para actualizar la contraseña.",
  };
}

export async function updatePasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = value(formData, "password");
  const confirmPassword = value(formData, "confirmPassword");
  const fieldErrors: AuthActionState["fieldErrors"] = {};

  if (!validatePassword(password)) {
    fieldErrors.password = "Usa al menos 8 caracteres, una letra y un número.";
  }
  if (password !== confirmPassword) fieldErrors.confirmPassword = "Las contraseñas no coinciden.";

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Revisa los datos ingresados.", fieldErrors };
  }

  const supabase = await createClient();
  if (!supabase) return configurationError();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { status: "error", message: "El enlace venció o la sesión ya no es válida. Solicita otro enlace." };
  }

  return { status: "success", message: "Contraseña actualizada correctamente." };
}

export async function updateProfileAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const fullName = value(formData, "fullName");

  if (fullName.length < 2 || fullName.length > 120) {
    return {
      status: "error",
      message: "Revisa los datos ingresados.",
      fieldErrors: { fullName: "Escribe un nombre de entre 2 y 120 caracteres." },
    };
  }

  const supabase = await createClient();
  if (!supabase) return configurationError();

  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (typeof userId !== "string") {
    return { status: "error", message: "La sesión venció. Inicia sesión nuevamente." };
  }

  const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", userId);

  if (error) return { status: "error", message: "No pudimos actualizar el perfil." };

  return { status: "success", message: "Perfil actualizado correctamente." };
}

export async function signOutAction() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/login");
}
