import EmbeddedMiniApp from "@/features/apps/components/EmbeddedMiniApp";
import ChessTeacherApp from "@/features/apps/components/ChessTeacherApp";
import HiitTimerApp from "@/features/apps/components/HiitTimerApp";
import MiniAppShell from "@/features/apps/components/MiniAppShell";
import SportsScoreboardApp from "@/features/apps/components/SportsScoreboardApp";
import TeamGeneratorApp from "@/features/apps/components/TeamGeneratorApp";
import type { MiniAppDefinition } from "@/features/apps/data/miniApps";

interface MiniAppWorkspaceProps {
  app: MiniAppDefinition;
}

const guidanceByApp: Record<string, string[]> = {
  "pizarra-tactica-multideporte": [
    "Selecciona el deporte antes de ubicar jugadores y dibujar recorridos.",
    "Utiliza el modo Mover para ajustar posiciones y las herramientas de trazo para explicar la jugada.",
    "Guarda o exporta la propuesta únicamente después de revisar posiciones, recorridos y sentido táctico.",
  ],
  "creador-certificados": [
    "Comprueba nombres, fecha, curso y motivo antes de generar el certificado.",
    "Utiliza la generación por lote únicamente después de revisar el primer certificado en la vista previa.",
    "Evita incluir datos sensibles; descarga los archivos y guárdalos conforme a las normas de privacidad de tu institución.",
  ],
  "generador-retos-30-dias": [
    "Configura el reto según la edad, el espacio disponible y el nivel real de los participantes.",
    "Revisa los 30 días antes de compartir el programa y adapta cualquier actividad que no sea segura para el grupo.",
    "Registra el avance en el mismo dispositivo y descarga las fichas importantes como respaldo.",
  ],
  "planificador-clases-express": [
    "Define el grado, la duración, el espacio y el propósito antes de generar la planificación.",
    "Revisa que los tiempos, materiales y actividades sean viables para el grupo y el entorno disponibles.",
    "Adapta la propuesta a las necesidades del alumnado antes de guardarla, compartirla o descargarla.",
  ],
  "planificador-civica-acompanamiento-integral": [
    "Selecciona el subnivel, la destreza cívica y la habilidad socioemocional antes de generar la planificación.",
    "Revisa la secuencia ERCA y adapta las actividades al contexto real del grupo.",
    "Comprueba que los indicadores de la rúbrica de frecuencia sean observables antes de copiar, compartir o imprimir.",
  ],
  "planificador-animacion-lectura": [
    "Define el subnivel, el tipo de texto y el propósito lector antes de utilizar la planificación.",
    "Revisa que los cinco momentos, los recursos y las preguntas respondan al contexto real del grupo.",
    "Comprueba la rúbrica y personaliza el documento antes de descargarlo para uso institucional.",
  ],
  "evaluador-inclusivo": [
    "Selecciona Habilidades Motrices Básicas, Capacidades Físicas u Observación Integral y define una tarea concreta.",
    "Valora evidencias observables, aplica apoyos para la participación y confirma las condiciones de seguridad.",
    "Utiliza iniciales o códigos y revisa la información antes de guardar, exportar o compartir.",
  ],
  "guia-juegos-en-movimiento": [
    "Elige el juego según el objetivo de la clase, la edad del grupo y el espacio realmente disponible.",
    "Comprueba el área, los materiales y la señal de detención; ofrece una variante equivalente sin perder el propósito motriz.",
    "Completa y guarda la ficha del juego en este dispositivo o descárgala como respaldo antes de aplicarla.",
  ],
  "yoga-en-movimiento": [
    "Selecciona el nivel y utiliza la pausa activa o la sesión completa siempre con supervisión adulta.",
    "Revisa el espacio, la superficie y las adaptaciones; ninguna postura debe producir dolor ni forzar articulaciones.",
    "Permite respirar normalmente, reducir el movimiento, pausar el temporizador o elegir una alternativa con apoyo.",
  ],
  "citaprofe-apa7": [
    "Selecciona el tipo real de fuente y transcribe los datos directamente desde el documento original.",
    "Revisa autores, fecha, título, DOI o URL; la herramienta no busca ni inventa metadatos bibliográficos.",
    "Comprueba la referencia antes de copiarla, añadirla a la bibliografía o descargar el documento DOCX.",
  ],
  "fundamentos-tendencias-educacion-fisica": [
    "Utiliza el índice o la búsqueda para localizar conceptos dentro del manuscrito completo.",
    "Marca los capítulos leídos, guarda notas privadas y responde las actividades relacionándolas con tu práctica docente.",
    "Diferencia el texto original de los recuadros de actualización académica y revisa las fuentes antes de citar el libro.",
  ],
  "metodologias-activas-educacion-fisica": [
    "Identifica primero si necesitas una metodología, un modelo pedagógico, un estilo de enseñanza o una estrategia organizativa.",
    "Adapta los ejemplos al propósito, la edad, el espacio, los recursos y la experiencia real del grupo.",
    "Aplica las condiciones de seguridad, inclusión y privacidad antes de utilizar cualquier actividad o recurso audiovisual.",
  ],
  "ajedrez-educativo": [
    "Utiliza el modo demostración para explicar movimientos, jaque y decisiones sin exponer datos estudiantiles.",
    "Crea retos con una consigna observable y comprueba personalmente que la posición tenga una solución legal.",
    "Combina explicación breve, práctica guiada y reflexión; el código del reto no contiene nombres ni datos personales.",
  ],
  "sorteador-equipos": [
    "Utiliza nombres, iniciales o números según las normas de privacidad de tu institución.",
    "Repite el sorteo cuando necesites reorganizar la clase.",
    "Revisa el resultado antes de anunciar los equipos.",
  ],
  "marcador-cronometro-deportivo": [
    "Personaliza los nombres de ambos equipos.",
    "Controla el tiempo y la puntuación desde la misma pantalla.",
    "Usa Restablecer únicamente al finalizar el encuentro.",
  ],
  "cronometro-circuitos-hiit": [
    "Configura trabajo, descanso y rondas antes de iniciar.",
    "Ajusta los intervalos a la edad y condición del grupo.",
    "Detén la actividad ante dolor, mareo o dificultad respiratoria.",
  ],
  "calculadora-intensidad-calorias": [
    "Utiliza datos aproximados cuando no dispongas de una medición reciente.",
    "Interpreta el resultado como una estimación orientativa.",
    "Ajusta la actividad a la condición individual de cada participante.",
  ],
  "rueda-retos-juegos": [
    "Revisa los retos antes de comenzar la actividad.",
    "Adapta cada propuesta al espacio y los materiales disponibles.",
    "Permite una alternativa equivalente cuando un estudiante la necesite.",
  ],
  "generador-diplomas": [
    "Comprueba cuidadosamente el nombre antes de imprimir.",
    "Personaliza el reconocimiento y la fecha.",
    "Utiliza la vista de impresión para guardar una copia en PDF.",
  ],
  "banco-dinamicas-rompehielos": [
    "Selecciona una dinámica adecuada para la edad del grupo.",
    "Explica las reglas mediante una demostración breve.",
    "Evita actividades que expongan información personal sensible.",
  ],
  "registro-test-fisicos": [
    "Utiliza iniciales o códigos si tu institución exige anonimización.",
    "Aplica siempre el mismo protocolo para comparar resultados.",
    "Respalda los registros importantes al terminar la sesión.",
  ],
  "generador-torneos-relampago": [
    "Confirma la lista de participantes antes de generar el torneo.",
    "Define el formato según el tiempo y el número de equipos.",
    "Reserva unos minutos para desempates y cierre.",
  ],
  "generador-pausas-activas": [
    "Escoge la audiencia y el tiempo disponible.",
    "Demuestra cada movimiento antes de iniciar el temporizador.",
    "Ofrece variantes de menor impacto cuando sean necesarias.",
  ],
  "desagregador-destrezas": [
    "Copia la destreza completa y conserva literalmente su código.",
    "Revisa que verbo, contenido y condición correspondan al currículo.",
    "Guarda el resultado únicamente después de verificarlo.",
  ],
  "activacion-conocimientos-previos": [
    "Escribe un tema o una destreza suficientemente específica.",
    "Escoge la versión regular o la versión con enfoque DUA.",
    "Adapta la propuesta al tiempo real del inicio de clase.",
  ],
  "formulador-objetivos-clase": [
    "Parte del tema o la destreza que trabajarás en clase.",
    "Revisa el nivel cognitivo y evita verbos ambiguos.",
    "Comprueba que el objetivo pueda observarse y evaluarse.",
  ],
  "calculadora-frecuencia-cardiaca": [
    "Ingresa la edad para obtener una estimación mediante Tanaka.",
    "Utiliza las zonas como referencia general de intensidad.",
    "Detén la actividad ante cualquier señal de malestar.",
  ],
  "calculadora-imc": [
    "Los rangos mostrados corresponden únicamente a personas adultas.",
    "El IMC es un indicador orientativo, no un diagnóstico.",
    "Evita publicar o compartir datos personales de salud.",
  ],
  "generador-rubricas": [
    "Describe con precisión el tema o la destreza a evaluar.",
    "Revisa que cada nivel exprese evidencias observables.",
    "Ajusta la rúbrica a la escala utilizada por tu institución.",
  ],
  "armador-plan-clase": [
    "Completa la duración, los recursos y el contexto del grupo.",
    "Revisa la coherencia entre objetivo, actividades y evaluación.",
    "Utiliza la vista de impresión para conservar el plan final.",
  ],
  "dinamicas-cierre-ticket-salida": [
    "Escribe el aprendizaje que deseas comprobar al finalizar.",
    "Selecciona la versión regular o la versión con enfoque DUA.",
    "Recoge una evidencia breve antes de despedir al grupo.",
  ],
};

export default function MiniAppWorkspace({ app }: MiniAppWorkspaceProps) {
  let tool;

  if (app.id === "sorteador-equipos") tool = <TeamGeneratorApp />;
  if (app.id === "marcador-cronometro-deportivo") tool = <SportsScoreboardApp />;
  if (app.id === "cronometro-circuitos-hiit") tool = <HiitTimerApp />;
  if (app.id === "ajedrez-educativo") tool = <ChessTeacherApp />;
  if (app.embeddedAsset) tool = <EmbeddedMiniApp app={app} />;

  return (
    <MiniAppShell app={app} guidance={guidanceByApp[app.id] ?? []}>
      {tool}
    </MiniAppShell>
  );
}
