import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import type { StudentSession } from "@/features/students/types";

export const STUDENT_SESSION_COOKIE = "pem_student_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30;

function getSessionSecret() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || null;
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function encodeSession(session: StudentSession, secret: string) {
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

function decodeSession(value: string, secret: string): StudentSession | null {
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload, secret));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as StudentSession;
    if (!session.studentId || !session.fullName || session.expiresAt <= Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export async function setStudentSession(student: Omit<StudentSession, "expiresAt">) {
  const secret = getSessionSecret();
  if (!secret) throw new Error("student_session_not_configured");

  const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000;
  const cookieStore = await cookies();
  cookieStore.set(STUDENT_SESSION_COOKIE, encodeSession({ ...student, expiresAt }, secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function getStudentSession(): Promise<StudentSession | null> {
  const secret = getSessionSecret();
  if (!secret) return null;

  const cookieStore = await cookies();
  const value = cookieStore.get(STUDENT_SESSION_COOKIE)?.value;
  return value ? decodeSession(value, secret) : null;
}

export async function clearStudentSession() {
  const cookieStore = await cookies();
  cookieStore.delete(STUDENT_SESSION_COOKIE);
}
