import type { Metadata } from "next";

import AuthForm from "@/features/auth/components/AuthForm";
import AuthPageShell from "@/features/auth/components/AuthPageShell";
import AuthSetupNotice from "@/features/auth/components/AuthSetupNotice";
import { getAuthAccess } from "@/features/auth/server/access";
import { requestPasswordResetAction } from "@/features/auth/server/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Recuperar contraseña | Profe en Movimiento" };

export default async function RecoverPasswordPage() {
  const access = await getAuthAccess();

  return (
    <AuthPageShell eyebrow="Recuperación" title="Vuelve a tu cuenta" description="Te enviaremos un enlace seguro para crear una nueva contraseña.">
      {access.configured ? <AuthForm mode="recover" action={requestPasswordResetAction} /> : <AuthSetupNotice />}
    </AuthPageShell>
  );
}
