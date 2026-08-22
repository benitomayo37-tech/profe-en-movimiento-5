import type { Metadata } from "next";

import LegalPageShell from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Contacto y soporte | Profe en Movimiento",
  description:
    "Canales de soporte para cuentas, compras, miniapps, Profe IA y Entrenador IA.",
};

const listClassName = "list-disc space-y-2 pl-6";

export default function ContactPage() {
  return (
    <LegalPageShell
      eyebrow="Estamos para ayudarte"
      title="Contacto y soporte"
      description="Escríbenos si necesitas ayuda con tu cuenta, una compra, el acceso al Plan Pro o el funcionamiento de las herramientas."
      updatedAt="8 de agosto de 2026"
      sections={[
        {
          id: "canal",
          title: "1. Canal principal",
          content: (
            <>
              <p>
                Correo de soporte:{" "}
                <a className="font-bold text-blue-700 underline underline-offset-4" href="mailto:profeenmovimiento@gmail.com">
                  profeenmovimiento@gmail.com
                </a>
              </p>
              <p>
                Atendemos consultas desde Quito, Ecuador. Intentaremos responder en un plazo
                de hasta 2 días laborables; los casos que dependan de Hotmart, Supabase u otro
                proveedor pueden necesitar tiempo adicional.
              </p>
            </>
          ),
        },
        {
          id: "informacion",
          title: "2. Qué información debes enviar",
          content: (
            <ul className={listClassName}>
              <li>Tu nombre y el correo asociado a la cuenta.</li>
              <li>La sección afectada: cuenta, miniapp, Profe IA, Entrenador IA o tienda.</li>
              <li>Una explicación breve de lo que intentabas hacer y del resultado obtenido.</li>
              <li>Captura del mensaje de error, ocultando información privada.</li>
              <li>
                Para compras: producto, fecha y código de transacción de Hotmart, sin datos
                bancarios.
              </li>
            </ul>
          ),
        },
        {
          id: "seguridad",
          title: "3. Información que nunca debes enviar",
          content: (
            <p>
              Nunca te pediremos tu contraseña, la clave de OpenAI, la service role key de
              Supabase, números completos de tarjeta, CVV ni códigos temporales de
              verificación. Si recibes una solicitud de este tipo, no respondas y comunícala
              al correo oficial.
            </p>
          ),
        },
        {
          id: "hotmart",
          title: "4. Compras y suscripciones de Hotmart",
          content: (
            <>
              <p>
                Para cancelar la renovación, administrar el método de pago o consultar una
                compra, ingresa a{" "}
                <a className="font-bold text-blue-700 underline underline-offset-4" href="https://consumer.hotmart.com" target="_blank" rel="noreferrer">
                  consumer.hotmart.com
                </a>
                . Para solicitar un reembolso dentro de la garantía, utiliza{" "}
                <a className="font-bold text-blue-700 underline underline-offset-4" href="https://refund.hotmart.com" target="_blank" rel="noreferrer">
                  refund.hotmart.com
                </a>
                .
              </p>
              <p>
                Si el pago está aprobado pero tu cuenta continúa como Plan Free, inicia sesión
                con el mismo correo usado en Hotmart y envíanos el código de transacción.
              </p>
            </>
          ),
        },
        {
          id: "datos",
          title: "5. Solicitudes sobre datos personales",
          content: (
            <p>
              Para ejercer derechos de acceso, actualización, eliminación, oposición u otro
              derecho reconocido por la legislación ecuatoriana, escribe desde el correo de
              tu cuenta con el asunto “Protección de datos”. Verificaremos tu identidad antes
              de atender la solicitud.
            </p>
          ),
        },
      ]}
    />
  );
}
