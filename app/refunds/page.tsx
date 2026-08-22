import type { Metadata } from "next";

import LegalPageShell from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Pagos y reembolsos | Profe en Movimiento",
  description:
    "Información sobre pagos, renovación, cancelación y reembolso de productos vendidos mediante Hotmart.",
};

const listClassName = "list-decimal space-y-2 pl-6";

export default function RefundsPage() {
  return (
    <LegalPageShell
      eyebrow="Compra segura"
      title="Pagos, cancelaciones y reembolsos"
      description="Conoce cómo se cobra el Plan Pro, cómo detener las renovaciones y cuándo puedes solicitar la devolución de una compra."
      updatedAt="8 de agosto de 2026"
      sections={[
        {
          id: "procesamiento",
          title: "1. Procesamiento del pago",
          content: (
            <>
              <p>
                Los pagos de la Suite de 19 miniapps se procesan en el entorno seguro de
                Hotmart. Antes de comprar verás el precio, la periodicidad, la moneda, los
                impuestos aplicables y los medios de pago disponibles para tu país.
              </p>
              <p>
                Profe en Movimiento recibe de Hotmart únicamente los datos necesarios para
                identificar la compra y activar o retirar el acceso. No almacenamos los datos
                completos de tu tarjeta.
              </p>
            </>
          ),
        },
        {
          id: "renovacion",
          title: "2. Renovación mensual",
          content: (
            <p>
              El Plan Pro mensual se renueva automáticamente y genera un nuevo cobro cada mes
              hasta que canceles la suscripción. Mientras el pago esté aprobado, conservarás
              el acceso a las funciones Pro incluidas en la oferta.
            </p>
          ),
        },
        {
          id: "cancelacion",
          title: "3. Cómo cancelar la suscripción",
          content: (
            <>
              <ol className={listClassName}>
                <li>
                  Ingresa a{" "}
                  <a className="font-bold text-blue-700 underline underline-offset-4" href="https://consumer.hotmart.com" target="_blank" rel="noreferrer">
                    consumer.hotmart.com
                  </a>
                  .
                </li>
                <li>Selecciona “Suite de 19 miniapps para docentes”.</li>
                <li>Abre “Configurar forma de pago”.</li>
                <li>Selecciona “Cancelar suscripción” y confirma.</li>
              </ol>
              <p>
                La cancelación impide cobros futuros. No significa automáticamente que se
                devolverá un pago ya procesado. El acceso puede finalizar al cancelarse la
                suscripción o al terminar el período pagado, según el estado comunicado por
                Hotmart.
              </p>
            </>
          ),
        },
        {
          id: "garantia",
          title: "4. Garantía de 7 días",
          content: (
            <p>
              La compra inicial de la Suite de 19 miniapps tiene una garantía de 7 días
              contados desde su aprobación. Dentro de ese plazo puedes solicitar el reembolso
              de la transacción inicial. Las renovaciones y cancelaciones se sujetan a las
              reglas de suscripción y garantía que Hotmart muestre en los detalles de la
              compra, además de los derechos irrenunciables previstos en la ley.
            </p>
          ),
        },
        {
          id: "solicitud",
          title: "5. Cómo solicitar un reembolso",
          content: (
            <ol className={listClassName}>
              <li>
                Accede a{" "}
                <a className="font-bold text-blue-700 underline underline-offset-4" href="https://refund.hotmart.com" target="_blank" rel="noreferrer">
                  refund.hotmart.com
                </a>
                .
              </li>
              <li>Ingresa el código de transacción recibido por correo; normalmente comienza por HP.</li>
              <li>Escribe el mismo correo utilizado en la compra.</li>
              <li>Completa la verificación de seguridad enviada a tu email.</li>
              <li>Conserva la confirmación y revisa el estado de la solicitud.</li>
            </ol>
          ),
        },
        {
          id: "efectos",
          title: "6. Efectos sobre el acceso",
          content: (
            <p>
              Una compra cancelada, reembolsada, vencida, atrasada o sometida a chargeback
              puede desactivar el Plan Pro automáticamente. Si consideras que hubo un error,
              envía el correo de la compra y el código de transacción a{" "}
              <a className="font-bold text-blue-700 underline underline-offset-4" href="mailto:profeenmovimiento@gmail.com">
                profeenmovimiento@gmail.com
              </a>
              . No envíes fotografías de tarjetas, contraseñas ni códigos de verificación.
            </p>
          ),
        },
      ]}
    />
  );
}
