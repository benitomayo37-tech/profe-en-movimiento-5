"use client";

import { useState } from "react";

type Protocol = {
  id: string;
  icon: string;
  title: string;
  summary: string;
  alerts: string[];
  actions: string[];
  avoid: string[];
  escalate: string[];
  followup: string[];
  source: { label: string; href: string };
};

const protocols: Protocol[] = [
  {
    id: "golpes-caidas",
    icon: "🤕",
    title: "Golpes y caídas",
    summary: "Qué revisar después de un impacto o una caída durante la actividad.",
    alerts: ["Pérdida de conciencia, confusión marcada o dificultad para despertar.", "Convulsiones, dificultad respiratoria o deterioro rápido.", "Dolor intenso, deformidad visible o incapacidad para utilizar una extremidad."],
    actions: ["Detén la actividad y comprueba primero que el entorno sea seguro.", "Observa la respuesta de la persona y los cambios que aparecen después del impacto.", "Mantén supervisión y activa el protocolo institucional si aparece una señal de alarma.", "Registra hechos observables, hora, lugar y acciones realizadas."],
    avoid: ["No fuerces a la persona a levantarse o continuar.", "No minimices síntomas que aparecen o empeoran con el tiempo.", "No administres medicamentos por cuenta propia."],
    escalate: ["Ante pérdida de respuesta, respiración anormal, convulsiones u otra condición potencialmente mortal, activa emergencias inmediatamente.", "Solicita valoración profesional ante síntomas importantes o persistentes."],
    followup: ["Mantén comunicación con la familia y la institución según su protocolo.", "No autorices el retorno a la actividad si persisten señales preocupantes."],
    source: { label: "Cruz Roja — First Aid Steps", href: "https://www.redcross.org/take-a-class/first-aid/performing-first-aid/first-aid-steps" },
  },
  {
    id: "torceduras-articulaciones",
    icon: "🦵",
    title: "Torceduras y dolor articular",
    summary: "Orientación inicial ante dolor, torcedura o dificultad para mover una articulación.",
    alerts: ["Deformidad evidente o posición anormal de la extremidad.", "Dolor intenso, pérdida importante de función o imposibilidad para apoyar/mover.", "Entumecimiento, cambio llamativo de color o empeoramiento rápido."],
    actions: ["Suspende la actividad y coloca a la persona en un lugar seguro.", "Evita cargar peso o movimientos que aumenten el dolor.", "Observa evolución y sigue el protocolo institucional para valoración.", "Registra cómo ocurrió y qué movimientos o funciones quedaron limitados."],
    avoid: ["No fuerces la articulación para comprobar su movilidad.", "No intentes recolocar una articulación o una extremidad.", "No autorices el retorno solo porque el dolor disminuya temporalmente."],
    escalate: ["Una deformidad, pérdida importante de función o alteración de sensibilidad requiere valoración profesional.", "Si existe una emergencia vital, activa inmediatamente los servicios de emergencia."],
    followup: ["Comunica el incidente según el protocolo institucional.", "Mantén el seguimiento de las restricciones indicadas por profesionales."],
    source: { label: "NHS — Sprains and strains", href: "https://www.nhs.uk/conditions/sprains-and-strains/" },
  },
  {
    id: "dificultad-respiratoria",
    icon: "🫁",
    title: "Dificultad respiratoria",
    summary: "Qué hacer cuando la respiración es claramente diferente de lo habitual.",
    alerts: ["La persona no responde o no respira normalmente.", "Dificultad respiratoria intensa, coloración anormal o deterioro rápido.", "Dolor intenso en el pecho, desmayo u otra señal grave."],
    actions: ["Detén la actividad y asegura un entorno tranquilo y seguro.", "Evalúa la respuesta y la respiración sin retrasar la activación de ayuda ante una señal crítica.", "Activa el protocolo institucional y solicita ayuda de emergencia cuando corresponda.", "Permanece con la persona y comunica al personal de respuesta lo observado."],
    avoid: ["No obligues a continuar la actividad.", "No administres medicamentos que no estén contemplados por el protocolo autorizado.", "No retrases la solicitud de ayuda para completar preguntas adicionales."],
    escalate: ["Si no responde, no respira normalmente o existe una condición potencialmente mortal, activa emergencias inmediatamente.", "Si la dificultad es importante o persiste, solicita valoración profesional."],
    followup: ["Documenta la situación y las acciones realizadas.", "Sigue las indicaciones de profesionales y del protocolo institucional antes de cualquier retorno."],
    source: { label: "Cruz Roja — First Aid Steps", href: "https://www.redcross.org/take-a-class/first-aid/performing-first-aid/first-aid-steps" },
  },
  {
    id: "sangrado",
    icon: "🩹",
    title: "Sangrado",
    summary: "Orientación educativa ante una herida o sangrado visible.",
    alerts: ["Sangrado abundante o que no se controla.", "Persona pálida, débil, confusa, desmayada o con deterioro rápido.", "Herida grave o situación que compromete la seguridad del entorno."],
    actions: ["Detén la actividad y utiliza protección adecuada si está disponible.", "Activa el protocolo institucional y solicita ayuda ante sangrado potencialmente grave.", "Aplica únicamente las medidas de primeros auxilios para las que estés capacitado y siguiendo el protocolo vigente.", "Comunica qué ocurrió, cuánto tiempo ha pasado y qué medidas se realizaron."],
    avoid: ["No minimices un sangrado abundante.", "No retrases la solicitud de ayuda por intentar resolver la situación de forma aislada.", "No administres medicamentos por cuenta propia."],
    escalate: ["El sangrado potencialmente mortal requiere activación inmediata de los servicios de emergencia.", "Solicita valoración profesional si el sangrado no se controla o la herida parece importante."],
    followup: ["Registra el incidente y la atención recibida.", "Sigue el protocolo institucional para comunicación con familia y autoridades."],
    source: { label: "Cruz Roja — First Aid Steps", href: "https://www.redcross.org/take-a-class/first-aid/performing-first-aid/first-aid-steps" },
  },
  {
    id: "calor-agotamiento",
    icon: "☀️",
    title: "Calor, deshidratación y agotamiento",
    summary: "Medidas de seguridad ante malestar relacionado con calor o esfuerzo.",
    alerts: ["Confusión, pérdida de conciencia o alteración importante del estado mental.", "Empeoramiento rápido o signos compatibles con una emergencia por calor.", "Vómitos persistentes o síntomas que no mejoran."],
    actions: ["Detén la actividad y lleva a la persona a un lugar fresco y seguro.", "Afloja ropa innecesaria y favorece el enfriamiento de forma segura.", "Si la persona está alerta y puede beber con seguridad, sigue el protocolo institucional para hidratación.", "Ante señales de golpe de calor o deterioro, activa ayuda de emergencia inmediatamente."],
    avoid: ["No permitas que una persona con alteración del estado mental beba.", "No la dejes sola si presenta señales importantes.", "No reanudes el ejercicio mientras persistan síntomas preocupantes."],
    escalate: ["La confusión o pérdida de conciencia en un contexto de calor puede ser una emergencia y requiere ayuda inmediata.", "Solicita valoración si los síntomas empeoran, persisten o incluyen vómitos repetidos."],
    followup: ["Revisa hidratación, pausas, sombra y condiciones ambientales antes de continuar el programa.", "Documenta el episodio y sigue las indicaciones profesionales para el retorno."],
    source: { label: "CDC — Heat-Related Illnesses", href: "https://www.cdc.gov/niosh/heat-stress/about/illnesses.html" },
  },
  {
    id: "tormentas",
    icon: "⛈️",
    title: "Tormentas eléctricas",
    summary: "Protocolo preventivo para actividades físicas al aire libre ante truenos o relámpagos.",
    alerts: ["Se escucha trueno o se observa relámpago mientras el grupo está al aire libre.", "La actividad se desarrolla cerca de agua, estructuras expuestas o zonas elevadas.", "No existe un refugio seguro disponible."],
    actions: ["Suspende inmediatamente la actividad exterior cuando haya amenaza de tormenta.", "Lleva al grupo a un edificio sustancial o a un vehículo cerrado con techo rígido.", "Mantén al grupo en el refugio al menos 30 minutos después del último trueno.", "Realiza el conteo del grupo y comunica cualquier incidencia al protocolo institucional."],
    avoid: ["No uses árboles aislados, gradas abiertas, cobertizos o refugios pequeños como protección.", "No permanezcas en campos abiertos ni cerca del agua.", "No reanudes la actividad inmediatamente después de que deje de llover."],
    escalate: ["Si alguien recibe un impacto o presenta una condición grave, activa atención de emergencia inmediatamente.", "Si no existe refugio seguro, sigue el protocolo institucional de evacuación y protección."],
    followup: ["Registra la suspensión y las condiciones observadas.", "Revisa la previsión y el plan de contingencia antes de programar nuevamente la actividad."],
    source: { label: "National Weather Service — Lightning Safety", href: "https://www.weather.gov/safety/lightning-tips" },
  },
  {
    id: "convulsiones",
    icon: "⚡",
    title: "Convulsiones",
    summary: "Qué hacer para proteger a una persona durante y después de una convulsión, sin intentar detener sus movimientos.",
    alerts: ["La convulsión dura más de 5 minutos o dura más de lo habitual para esa persona.", "Ocurre otra convulsión antes de que la persona recupere la conciencia.", "Es la primera convulsión conocida, hubo una lesión importante o la persona tiene dificultad para respirar después.", "La convulsión ocurre en el agua o existe otra situación que compromete directamente la seguridad."],
    actions: ["Mantén la calma y despeja alrededor los objetos duros, cortantes o peligrosos.", "Protege la cabeza con algo blando si la persona está en el suelo y afloja la ropa apretada alrededor del cuello.", "Cronometra desde el inicio y observa lo ocurrido para comunicarlo posteriormente.", "Cuando terminen las convulsiones, si respira normalmente, colócala de lado en posición de recuperación y permanece con ella hasta que se recupere."],
    avoid: ["No sujetes ni intentes detener los movimientos.", "No pongas nada en la boca ni intentes separar los dientes.", "No des comida, bebida ni medicamentos por la boca mientras no esté completamente recuperada.", "No muevas a la persona salvo que exista un peligro inmediato que obligue a hacerlo."],
    escalate: ["Si dura más de 5 minutos, se repite sin recuperación, hay dificultad respiratoria después, una lesión importante o es la primera convulsión conocida, activa los servicios de emergencia de tu localidad.", "Si existe un plan de atención individual previamente establecido y estás capacitado y autorizado para seguirlo, aplícalo según el protocolo institucional."],
    followup: ["Permanece con la persona hasta que esté plenamente recuperada y orientada.", "Registra la hora de inicio y finalización, lo observado y cualquier lesión o dificultad respiratoria.", "Comunica el incidente a la familia y a la institución según el protocolo vigente."],
    source: { label: "NHS — What to do if someone has a seizure", href: "https://www.nhs.uk/symptoms/what-to-do-if-someone-has-a-seizure-fit/" },
  },
  {
    id: "crisis-emocional",
    icon: "💬",
    title: "Crisis emocional",
    summary: "Acompañamiento inicial ante ansiedad, angustia, bloqueo o desregulación emocional.",
    alerts: ["Riesgo inmediato de daño para la persona o para otras personas.", "Pérdida importante de contacto con la realidad o conducta que no puede mantenerse segura.", "La situación supera la capacidad de supervisión disponible en el contexto escolar/deportivo."],
    actions: ["Retira estímulos innecesarios y busca un espacio seguro y tranquilo.", "Mantén una comunicación calmada, breve y respetuosa.", "No dejes sola a la persona si existe una preocupación de seguridad.", "Activa el protocolo institucional y contacta al personal responsable o especializado."],
    avoid: ["No ridiculices, amenaces ni confrontes innecesariamente.", "No prometas confidencialidad absoluta cuando existe riesgo para la seguridad.", "No conviertas una crisis en una sanción durante el momento de mayor desregulación."],
    escalate: ["Ante riesgo inmediato de daño, activa el protocolo institucional y los servicios de emergencia correspondientes.", "Solicita apoyo del equipo de orientación o profesional responsable según las normas de la institución."],
    followup: ["Registra hechos observables sin diagnósticos ni etiquetas.", "Asegura el seguimiento institucional y la comunicación con la familia cuando corresponda."],
    source: { label: "OMS — Mental health in schools", href: "https://www.who.int/teams/mental-health-and-substance-use/promotion-prevention/mental-health-in-schools" },
  },
  {
    id: "espacio-materiales",
    icon: "⚠️",
    title: "Riesgos de espacios y materiales",
    summary: "Qué hacer cuando una instalación, superficie o material deja de ser seguro.",
    alerts: ["Estructura inestable, cableado expuesto, superficie peligrosa o riesgo de caída.", "Material deportivo roto, cortante, suelto o con daño visible.", "Condiciones ambientales que hacen insegura la actividad."],
    actions: ["Detén la actividad en la zona afectada y aleja al grupo del peligro.", "Señaliza o restringe el acceso cuando sea posible y seguro hacerlo.", "Informa al responsable institucional y solicita reparación o sustitución.", "Reorganiza la actividad en un espacio seguro si el protocolo lo permite."],
    avoid: ["No continúes utilizando un material o espacio que presenta un riesgo evidente.", "No improvises reparaciones que puedan crear un peligro adicional.", "No permitas que estudiantes manipulen instalaciones potencialmente peligrosas."],
    escalate: ["Si existe peligro inmediato para varias personas, activa el protocolo institucional de seguridad y evacuación correspondiente.", "Solicita apoyo técnico o institucional antes de volver a utilizar el espacio."],
    followup: ["Registra el riesgo detectado y la acción adoptada.", "Verifica que la corrección haya sido realizada antes de reanudar la actividad."],
    source: { label: "Cruz Roja — First Aid Steps", href: "https://www.redcross.org/take-a-class/first-aid/performing-first-aid/first-aid-steps" },
  },
];

export default function ProtocolLibrary({ onBack }: { onBack: () => void }) {
  const [selected, setSelected] = useState<Protocol | null>(null);

  if (selected) {
    return (
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[.18em] text-blue-700">Protocolo de seguridad</p>
            <h2 className="mt-1 text-2xl font-black">{selected.icon} {selected.title}</h2>
          </div>
          <button onClick={() => setSelected(null)} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-600 hover:bg-slate-100">← Volver a protocolos</button>
        </div>
        <div className="p-6 sm:p-8">
          <p className="max-w-3xl text-base leading-7 text-slate-600">{selected.summary}</p>
          <div className="mt-7 grid gap-5 lg:grid-cols-2">
            <ProtocolBlock title="Señales de alerta" items={selected.alerts} tone="red" />
            <ProtocolBlock title="Qué hacer" items={selected.actions} tone="green" />
            <ProtocolBlock title="Qué evitar" items={selected.avoid} tone="orange" />
            <ProtocolBlock title="Cuándo escalar" items={selected.escalate} tone="blue" />
          </div>
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="font-black text-slate-950">Seguimiento</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">{selected.followup.map(item => <li key={item}>• {item}</li>)}</ul>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs leading-5 text-blue-900">Material educativo. No sustituye valoración sanitaria, servicios de emergencia ni protocolos institucionales.</p>
            <a href={selected.source.href} target="_blank" rel="noreferrer" className="text-sm font-black text-blue-700 underline">Fuente: {selected.source.label} ↗</a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5">
        <div><p className="text-xs font-black uppercase tracking-[.18em] text-blue-700">Consulta rápida</p><h2 className="mt-1 text-2xl font-black">Consultar protocolos</h2></div>
        <button onClick={onBack} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-600 hover:bg-slate-100">← Volver</button>
      </div>
      <div className="p-6 sm:p-8">
        <p className="max-w-3xl text-slate-600">Selecciona una situación para consultar señales de alerta, acciones iniciales, qué evitar y cuándo solicitar ayuda.</p>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {protocols.map(protocol => (
            <button key={protocol.id} onClick={() => setSelected(protocol)} className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md">
              <span className="text-3xl" aria-hidden="true">{protocol.icon}</span>
              <h3 className="mt-4 font-black text-slate-950">{protocol.title}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-500">{protocol.summary}</p>
              <span className="mt-4 inline-flex text-sm font-black text-blue-700">Consultar guía →</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProtocolBlock({ title, items, tone }: { title: string; items: string[]; tone: "red" | "green" | "orange" | "blue" }) {
  const styles = {
    red: "border-red-200 bg-red-50 text-red-950",
    green: "border-emerald-200 bg-emerald-50 text-emerald-950",
    orange: "border-orange-200 bg-orange-50 text-orange-950",
    blue: "border-blue-200 bg-blue-50 text-blue-950",
  } as const;
  return <div className={`rounded-2xl border p-5 ${styles[tone]}`}><h3 className="font-black">{title}</h3><ul className="mt-3 space-y-2 text-sm leading-6">{items.map(item => <li key={item}>• {item}</li>)}</ul></div>;
}
