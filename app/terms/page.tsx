import type { Metadata } from "next";
import Link from "next/link";

import LegalPageShell from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Términos de uso | Profe en Movimiento",
  description:
    "Condiciones de uso de la plataforma, sus herramientas educativas y el Plan Pro.",
};

const listClassName = "list-disc space-y-2 pl-6";

export default function TermsPage() {
  return (
    <LegalPageShell
      eyebrow="Condiciones del servicio"
      title="Términos de uso"
      description="Estas condiciones regulan el acceso a Profe en Movimiento, sus recursos, herramientas de inteligencia artificial y productos digitales."
      updatedAt="8 de agosto de 2026"
      sections={[
        {
          id: "aceptacion",
          title: "1. Titular y aceptación",
          content: (
            <p>
              Profe en Movimiento es una plataforma educativa operada por Armando Mayo
              García en Quito, Ecuador. Al crear una cuenta, utilizar las herramientas o
              comprar un producto, aceptas estos términos y la{" "}
              <Link className="font-bold text-blue-700 underline underline-offset-4" href="/privacy">
                Política de privacidad
              </Link>.
            </p>
          ),
        },
        {
          id: "cuenta",
          title: "2. Cuenta y acceso",
          content: (
            <ul className={listClassName}>
              <li>Debes proporcionar información verdadera y mantener segura tu contraseña.</li>
              <li>La cuenta es personal y no debe compartirse con terceros.</li>
              <li>Debes ser mayor de edad para contratar un Plan Pro.</li>
              <li>
                Eres responsable de la actividad realizada desde tu cuenta y de avisarnos
                si sospechas un acceso no autorizado.
              </li>
            </ul>
          ),
        },
        {
          id: "servicios",
          title: "3. Servicios Free y Pro",
          content: (
            <>
              <p>
                El Plan Free ofrece las funciones que se identifiquen como gratuitas. El
                Plan Pro habilita las miniapps y herramientas indicadas en la oferta
                vigente mientras la suscripción se encuentre activa y pagada.
              </p>
              <p>
                Podemos mejorar, reorganizar o sustituir funciones sin reducir de manera
                arbitraria el acceso ya pagado. Las interrupciones necesarias por
                mantenimiento, seguridad o causas externas se resolverán tan pronto como
                sea razonablemente posible.
              </p>
            </>
          ),
        },
        {
          id: "ia",
          title: "4. Uso responsable de la inteligencia artificial",
          content: (
            <>
              <p>
                Profe IA y Entrenador IA generan borradores de apoyo. Sus respuestas pueden
                contener errores, omisiones o propuestas que requieran adaptación.
              </p>
              <ul className={listClassName}>
                <li>
                  Revisa objetivos, cargas, progresiones, seguridad, inclusión y normativa
                  curricular antes de utilizar un resultado.
                </li>
                <li>
                  La plataforma no reemplaza el criterio profesional del docente,
                  entrenador, médico u otro especialista.
                </li>
                <li>
                  No introduzcas datos sensibles o identificables de estudiantes, en
                  especial de menores de edad.
                </li>
                <li>
                  La decisión final sobre la aplicación de un contenido corresponde al
                  usuario profesional.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "uso-permitido",
          title: "5. Uso permitido y prohibiciones",
          content: (
            <>
              <p>Puedes utilizar los resultados para tu práctica educativa personal o institucional.</p>
              <p>No está permitido:</p>
              <ul className={listClassName}>
                <li>revender, sublicenciar o publicar masivamente los productos adquiridos;</li>
                <li>copiar la plataforma, eludir controles de acceso o extraer datos de forma automatizada;</li>
                <li>usar el servicio para actividades ilegales, discriminatorias, engañosas o peligrosas;</li>
                <li>introducir malware o intentar vulnerar cuentas, servidores o proveedores;</li>
                <li>suplantar a otra persona o compartir una cuenta Pro entre múltiples usuarios.</li>
              </ul>
            </>
          ),
        },
        {
          id: "propiedad",
          title: "6. Propiedad intelectual",
          content: (
            <>
              <p>
                La marca, diseño, código, recursos, ebooks, manuales y miniapps son propiedad
                de Profe en Movimiento o se utilizan con autorización. La compra concede una
                licencia personal, limitada, no exclusiva y no transferible; no transfiere
                los derechos de autor.
              </p>
              <p>
                Conservas los derechos que te correspondan sobre los contenidos originales
                que aportes. Nos autorizas a procesarlos únicamente para prestar la función
                solicitada y mantener la seguridad del servicio.
              </p>
            </>
          ),
        },
        {
          id: "pagos",
          title: "7. Pagos, suscripciones y reembolsos",
          content: (
            <>
              <p>
                Los cobros se procesan mediante Hotmart. El precio, moneda, periodicidad,
                impuestos y métodos disponibles aparecen antes de confirmar la compra. Una
                suscripción mensual o anual se renueva automáticamente según la periodicidad
                elegida hasta su cancelación.
              </p>
              <p>
                Cancelar evita cobros futuros, pero no equivale por sí mismo a reembolsar un
                pago ya realizado. La garantía configurada para la Suite Pro de miniapps es de
                7 días desde la aprobación de la compra inicial, conforme a las condiciones
                mostradas en Hotmart. Consulta los detalles en{" "}
                <Link className="font-bold text-blue-700 underline underline-offset-4" href="/refunds">
                  Pagos y reembolsos
                </Link>.
              </p>
            </>
          ),
        },
        {
          id: "suspension",
          title: "8. Suspensión y terminación",
          content: (
            <p>
              Podemos restringir o cerrar una cuenta ante fraude, impago, reembolso,
              chargeback, incumplimiento grave, riesgo de seguridad o uso ilícito. Cuando sea
              posible, informaremos el motivo y ofreceremos un canal de revisión.
            </p>
          ),
        },
        {
          id: "responsabilidad",
          title: "9. Responsabilidad",
          content: (
            <p>
              Prestamos el servicio con diligencia razonable. No garantizamos que cada
              contenido generado sea exacto o adecuado para todas las personas y contextos.
              Nada en estos términos limita los derechos irrenunciables reconocidos a los
              consumidores por la legislación aplicable.
            </p>
          ),
        },
        {
          id: "ley",
          title: "10. Cambios, legislación y contacto",
          content: (
            <p>
              Podemos actualizar estos términos y publicaremos la fecha de la nueva versión.
              Se aplican las leyes de la República del Ecuador, sin perjuicio de las normas
              imperativas que protejan al consumidor en su lugar de residencia. Para soporte,
              visita la{" "}
              <Link className="font-bold text-blue-700 underline underline-offset-4" href="/contact">
                página de contacto
              </Link>.
            </p>
          ),
        },
      ]}
    />
  );
}
