import EmbeddedMiniApp from "@/features/apps/components/EmbeddedMiniApp";
import HiitTimerApp from "@/features/apps/components/HiitTimerApp";
import MiniAppShell from "@/features/apps/components/MiniAppShell";
import SportsScoreboardApp from "@/features/apps/components/SportsScoreboardApp";
import TeamGeneratorApp from "@/features/apps/components/TeamGeneratorApp";
import type { MiniAppDefinition } from "@/features/apps/data/miniApps";

interface MiniAppWorkspaceProps {
  app: MiniAppDefinition;
}

const guidanceByApp: Record<string, string[]> = {
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
  if (app.embeddedAsset) tool = <EmbeddedMiniApp app={app} />;

  return (
    <MiniAppShell app={app} guidance={guidanceByApp[app.id] ?? []}>
      {tool}
    </MiniAppShell>
  );
}
