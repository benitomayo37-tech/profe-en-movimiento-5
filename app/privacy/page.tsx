import type { Metadata } from "next";
import Link from "next/link";

import LegalPageShell from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Política de privacidad | Profe en Movimiento",
  description:
    "Información sobre el tratamiento y la protección de datos personales en Profe en Movimiento.",
};

const listClassName = "list-disc space-y-2 pl-6";

export default function PrivacyPage() {
  return (
    <LegalPageShell
      eyebrow="Protección de datos"
      title="Política de privacidad"
      description="Explicamos qué información utilizamos, para qué la necesitamos y cómo puedes ejercer tus derechos sobre tus datos personales."
      updatedAt="26 de agosto de 2026"
      sections={[
        {
          id: "responsable",
          title: "1. Responsable del tratamiento",
          content: (
            <>
              <p>
                El responsable del tratamiento es <strong>Armando Mayo García</strong>,
                titular de la marca educativa <strong>Profe en Movimiento</strong>, con
                operación en Quito, Ecuador.
              </p>
              <p>
                Para consultas o para ejercer tus derechos, escribe a{" "}
                <a
                  className="font-bold text-blue-700 underline underline-offset-4"
                  href="mailto:profeenmovimiento@gmail.com"
                >
                  profeenmovimiento@gmail.com
                </a>
                .
              </p>
            </>
          ),
        },
        {
          id: "datos",
          title: "2. Datos que podemos tratar",
          content: (
            <ul className={listClassName}>
              <li>Nombre, correo electrónico e identificador de cuenta.</li>
              <li>Estado del plan y datos técnicos necesarios para habilitar accesos.</li>
              <li>
                Identificadores y eventos comerciales comunicados por Hotmart, sin
                almacenar en nuestros servidores los datos completos de tu tarjeta.
              </li>
              <li>
                Consultas, configuraciones y contenidos que decides enviar a Profe IA o
                Entrenador IA.
              </li>
              <li>
                Datos técnicos básicos de sesión, seguridad y funcionamiento, como
                cookies de autenticación, registros de errores y dirección IP cuando sea
                procesada por nuestros proveedores de infraestructura.
              </li>
              <li>Mensajes y archivos que compartas al solicitar soporte.</li>
              <li>
                Registros educativos de incidentes creados voluntariamente en
                MueveSeguro, como institución, docente responsable, estudiante o
                identificador interno, fecha, lugar, hechos observables, actuaciones,
                notificaciones, seguimientos y estado del caso.
              </li>
            </ul>
          ),
        },
        {
          id: "finalidades",
          title: "3. Finalidades y bases de legitimación",
          content: (
            <>
              <p>Utilizamos los datos únicamente para:</p>
              <ul className={listClassName}>
                <li>crear y proteger tu cuenta;</li>
                <li>prestar las herramientas gratuitas y Pro contratadas;</li>
                <li>procesar la activación, renovación o cancelación del Plan Pro;</li>
                <li>generar los materiales que solicites mediante inteligencia artificial;</li>
                <li>atender soporte, prevenir fraude y mantener la seguridad;</li>
                <li>cumplir obligaciones legales y resolver reclamos.</li>
                <li>
                  conservar la trazabilidad de los incidentes y seguimientos que el
                  usuario decida documentar mediante MueveSeguro;
                </li>
              </ul>
              <p>
                El tratamiento se sustenta, según corresponda, en la ejecución del
                servicio solicitado, tu consentimiento, el cumplimiento de obligaciones
                legales y el interés legítimo de proteger y mejorar la plataforma.
              </p>
            </>
          ),
        },
        {
          id: "proveedores",
          title: "4. Proveedores y transferencias",
          content: (
            <>
              <p>
                Para operar la plataforma utilizamos proveedores especializados que
                procesan información bajo sus propias medidas y condiciones de seguridad:
              </p>
              <ul className={listClassName}>
                <li><strong>Supabase:</strong> autenticación, perfiles y base de datos.</li>
                <li><strong>Vercel:</strong> alojamiento, distribución y registros técnicos.</li>
                <li><strong>OpenAI:</strong> procesamiento de las solicitudes dirigidas a las herramientas de IA.</li>
                <li><strong>Hotmart:</strong> checkout, cobros, suscripciones, reembolsos y eventos de pago.</li>
              </ul>
              <p>
                Estos servicios pueden procesar datos fuera de Ecuador. Aplicamos las
                salvaguardas contractuales y técnicas disponibles para estas transferencias.
              </p>
            </>
          ),
        },
        {
          id: "conservacion",
          title: "5. Conservación y seguridad",
          content: (
            <>
              <p>
                Conservamos los datos mientras tu cuenta permanezca activa y durante el
                tiempo necesario para prestar el servicio, atender reclamos, prevenir
                fraude o cumplir obligaciones legales. Después se eliminarán o
                anonimizarán cuando resulte procedente.
              </p>
              <p>
                Aplicamos controles de acceso, autenticación, conexiones cifradas y
                separación de credenciales. Ningún sistema es completamente infalible;
                si detectamos un incidente relevante, actuaremos conforme a la normativa
                aplicable.
              </p>
            </>
          ),
        },
        {
          id: "derechos",
          title: "6. Tus derechos",
          content: (
            <>
              <p>
                Puedes solicitar acceso, rectificación y actualización, eliminación,
                oposición, suspensión o portabilidad de tus datos cuando corresponda,
                además de retirar un consentimiento previamente otorgado.
              </p>
              <p>
                Envía tu solicitud desde el correo asociado a tu cuenta, indicando el
                derecho que deseas ejercer. Podremos pedir información razonable para
                verificar tu identidad. También puedes presentar una reclamación ante la
                Superintendencia de Protección de Datos Personales del Ecuador.
              </p>
            </>
          ),
        },
        {
          id: "menores",
          title: "7. Datos de estudiantes y menores",
          content: (
            <>
              <p>
                La cuenta está dirigida a docentes, entrenadores y personas adultas. No
                solicites a estudiantes que creen cuentas ni introduzcas fotografías,
                diagnósticos, calificaciones u otros datos identificables de menores en
                las herramientas de IA.
              </p>
              <p>
                Para actividades de clase, utiliza datos anónimos, iniciales o ejemplos
                ficticios y respeta las autorizaciones de tu institución educativa.
              </p>
              <p>
                MueveSeguro es una herramienta separada de las funciones de IA y permite
                registrar incidentes educativos. Utiliza únicamente los datos mínimos
                necesarios, evita diagnósticos o información clínica innecesaria y
                asegúrate de contar con la autorización, competencia institucional y base
                legítima aplicable antes de identificar a un estudiante. El acceso queda
                limitado a la cuenta que creó el registro mediante controles de seguridad
                en la base de datos.
              </p>
            </>
          ),
        },
        {
          id: "cambios",
          title: "8. Cambios y contacto",
          content: (
            <p>
              Podemos actualizar esta política cuando cambie el servicio o la normativa.
              Publicaremos la versión vigente en esta página. Para preguntas, consulta la{" "}
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
