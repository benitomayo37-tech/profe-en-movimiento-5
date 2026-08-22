import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AuthForm from "@/features/auth/components/AuthForm";
import AuthPageShell from "@/features/auth/components/AuthPageShell";
import AuthSetupNotice from "@/features/auth/components/AuthSetupNotice";
import { getAuthAccess } from "@/features/auth/server/access";
import { updatePasswordAction } from "@/features/auth/server/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Actualizar contraseña | Profe en Movimiento" };

export default async function UpdatePasswordPage() {
  const access = await getAuthAccess();
  if (access.configured && !access.authenticated) redirect("/login?error=enlace");

  return (
    <AuthPageShell eyebrow="Seguridad" title="Nueva contraseña" description="Elige una contraseña que no utilices en otros servicios.">
      {access.configured ? <AuthForm mode="update-password" action={updatePasswordAction} /> : <AuthSetupNotice />}
    </AuthPageShell>
  );
}
