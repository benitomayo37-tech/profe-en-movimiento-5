import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

const STUDENT_SESSION_COOKIE = "pem_student_session";

export async function proxy(request: NextRequest) {
  const studentSession = request.cookies.get(STUDENT_SESSION_COOKIE)?.value;
  const studentAllowedPaths = ["/", "/estudiantes", "/login", "/registro", "/privacy", "/terms", "/contact"];
  const isStudentAllowedPath = studentAllowedPaths.some((path) => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(`${path}/`));

  if (studentSession && !isStudentAllowedPath) {
    return NextResponse.redirect(new URL("/estudiantes", request.url));
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/ai",
    "/",
    "/dashboard",
    "/apps/:path*",
    "/compra-confirmada",
    "/entrenador-ia/:path*",
    "/cuenta/:path*",
    "/historial/:path*",
    "/mueve-seguro/:path*",
    "/login",
    "/registro",
    "/recuperar-contrasena",
    "/actualizar-contrasena",
    "/auth/:path*",
    "/api/miniapps/:path*",
    "/api/ai/:path*",
    "/api/trainer/:path*",
    "/api/resources/:path*",
    "/estudiantes/:path*",
    "/resources/:path*",
    "/store/:path*",
  ],
};
