import "server-only";

import { NextResponse } from "next/server";

import { getAuthAccess } from "@/features/auth/server/access";
import type { AuthAccess } from "@/features/auth/types";

function accessError(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

export async function requireAuthenticatedAIAccess() {
  const result = await getAuthenticatedApiAccess("Profe IA");

  return result.error;
}

export async function getAuthenticatedApiAccess(
  productName: string,
): Promise<
  | { access: AuthAccess; error: null }
  | { access: null; error: NextResponse }
> {
  const access = await getAuthAccess();

  if (!access.configured) {
    return {
      access: null,
      error: accessError(
        "La autenticación no está configurada temporalmente.",
        503,
      ),
    };
  }

  if (!access.authenticated) {
    return {
      access: null,
      error: accessError(
        `Debes iniciar sesión para utilizar ${productName}.`,
        401,
      ),
    };
  }

  return { access, error: null };
}

export async function requireTrainerProAccess() {
  const access = await getAuthAccess();

  if (!access.configured) {
    return accessError(
      "La autenticación no está configurada temporalmente.",
      503,
    );
  }

  if (!access.authenticated) {
    return accessError(
      "Debes iniciar sesión para utilizar Entrenador IA.",
      401,
    );
  }

  if (!access.hasProAccess) {
    return accessError(
      "Entrenador IA requiere un Plan Pro activo.",
      403,
    );
  }

  return null;
}
