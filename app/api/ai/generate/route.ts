import OpenAI from "openai";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  buildPedagogicalPrompt,
  PROFE_GPT_INSTRUCTIONS,
} from "@/features/ai/prompts/buildPedagogicalPrompt";
import { getAuthenticatedApiAccess } from "@/features/auth/server/apiAccess";
import {
  releaseFreeGeneration,
  reserveFreeGeneration,
} from "@/features/auth/server/freeUsage";
import { generatedContentSchema } from "@/features/ai/schemas/generatedContentSchema";
import { recordCurrentUserActivity } from "@/features/dashboard/server/activity";
import type {
  AIFormData,
  GeneratedAIContent,
} from "@/features/ai/types/ai";
import { normalizeGeneratedContent } from "@/features/ai/utils/normalizeGeneratedContent";
import {
  extractDurationMinutes,
  requiresDurationPlan,
  validateGeneratedDuration,
} from "@/features/ai/utils/validateGeneratedDuration";
import {
  isStructurallyValidGeneratedExam,
  validateGeneratedExam,
} from "@/features/ai/utils/validateGeneratedExam";
import { validateGeneratedLogistics } from "@/features/ai/utils/validateGeneratedLogistics";
import { validateGeneratedMethodology } from "@/features/ai/utils/validateGeneratedMethodology";
import { validateGeneratedRubric } from "@/features/ai/utils/validateGeneratedRubric";
import { validateGeneratedChecklist } from "@/features/ai/utils/validateGeneratedChecklist";
import { validateGeneratedDuaAdaptation } from "@/features/ai/utils/validateGeneratedDuaAdaptation";
import { validateGeneratedNeeAdaptation } from "@/features/ai/utils/validateGeneratedNeeAdaptation";
import { validateGeneratedPhysicalCircuit } from "@/features/ai/utils/validateGeneratedPhysicalCircuit";
import { validateGeneratedGame } from "@/features/ai/utils/validateGeneratedGame";
import { validateGeneratedPedagogy } from "@/features/ai/utils/validateGeneratedPedagogy";
import { isValidAIFormData } from "@/features/ai/utils/validateAIFormData";
import { validateGeneratedAssessment } from "@/features/ai/utils/validateGeneratedAssessment";
import { validateGeneratedObjective } from "@/features/ai/utils/validateGeneratedObjective";

export const runtime = "nodejs";

const MAX_REQUEST_SIZE = 12_000;
const MAX_GENERATION_ATTEMPTS = 3;

function createErrorResponse(
  message: string,
  status: number,
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    {
      status,
    },
  );
}

function isValidDurationPlan(
  value: unknown,
): boolean {
  if (value === null) {
    return true;
  }

  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const plan =
    value as Record<string, unknown>;

  if (
    !Number.isInteger(
      plan.requestedMinutes,
    ) ||
    !Number.isInteger(
      plan.totalMinutes,
    ) ||
    !Array.isArray(plan.blocks)
  ) {
    return false;
  }

  if (
    Number(plan.requestedMinutes) <= 0 ||
    Number(plan.totalMinutes) <= 0 ||
    plan.blocks.length === 0
  ) {
    return false;
  }

  return plan.blocks.every((block) => {
    if (
      typeof block !== "object" ||
      block === null
    ) {
      return false;
    }

    const typedBlock =
      block as Record<string, unknown>;

    return (
      typeof typedBlock.label === "string" &&
      typedBlock.label.trim().length > 0 &&
      Number.isInteger(
        typedBlock.minutes,
      ) &&
      Number(typedBlock.minutes) > 0
    );
  });
}

function isValidLogisticsPlan(
  value: unknown,
): boolean {
  if (value === null) {
    return true;
  }

  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const plan =
    value as Record<string, unknown>;

  const positiveIntegerFields = [
    plan.studentCount,
    plan.groupCount,
    plan.stations,
    plan.groupsPerStation,
  ];

  const nonNegativeIntegerFields = [
    plan.simultaneousParticipants,
    plan.waitingParticipants,
    plan.fixedTargetsRequired,
  ];

  if (
    positiveIntegerFields.some(
      (field) =>
        !Number.isInteger(field) ||
        Number(field) <= 0,
    ) ||
    nonNegativeIntegerFields.some(
      (field) =>
        !Number.isInteger(field) ||
        Number(field) < 0,
    )
  ) {
    return false;
  }

  if (
    plan.fixedTargetsAvailable !== null &&
    (
      !Number.isInteger(
        plan.fixedTargetsAvailable,
      ) ||
      Number(
        plan.fixedTargetsAvailable,
      ) < 0
    )
  ) {
    return false;
  }

  if (
    !Array.isArray(plan.resources) ||
    plan.resources.length === 0 ||
    typeof plan.spaceDescription !==
      "string" ||
    plan.spaceDescription.trim().length ===
      0 ||
    typeof plan.collisionRiskControlled !==
      "boolean"
  ) {
    return false;
  }

  return plan.resources.every((resource) => {
    if (
      typeof resource !== "object" ||
      resource === null
    ) {
      return false;
    }

    const typedResource =
      resource as Record<string, unknown>;

    const availableIsValid =
      typedResource.available === null ||
      (
        Number.isInteger(
          typedResource.available,
        ) &&
        Number(
          typedResource.available,
        ) >= 0
      );

    return (
      typeof typedResource.name ===
        "string" &&
      typedResource.name.trim().length >
        0 &&
      availableIsValid &&
      Number.isInteger(
        typedResource.required,
      ) &&
      Number(typedResource.required) >= 0
    );
  });
}

function isGeneratedAIContent(
  value: unknown,
): value is GeneratedAIContent {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const content =
    value as Record<string, unknown>;

  if (
    typeof content.title !== "string" ||
    typeof content.introduction !== "string" ||
    !Array.isArray(content.sections) ||
    !("durationPlan" in content) ||
    !isValidDurationPlan(
      content.durationPlan,
    ) ||
        !("logisticsPlan" in content) ||
    !isValidLogisticsPlan(
      content.logisticsPlan,
    ) ||
    !("exam" in content) ||
    !isStructurallyValidGeneratedExam(
      content.exam,
    )
  ) {
    return false;
  }

  const sectionsAreValid =
    content.sections.every((section) => {
      if (
        typeof section !== "object" ||
        section === null
      ) {
        return false;
      }

      const typedSection =
        section as Record<string, unknown>;

      return (
        typeof typedSection.title ===
          "string" &&
        Array.isArray(
          typedSection.content,
        ) &&
        typedSection.content.every(
          (item) =>
            typeof item === "string",
        )
      );
    });

  if (!sectionsAreValid) {
    return false;
  }

  if (
    content.rubric === undefined ||
    content.rubric === null
  ) {
    return true;
  }

  if (
    typeof content.rubric !== "object"
  ) {
    return false;
  }

  const rubric =
    content.rubric as Record<
      string,
      unknown
    >;

  if (
    typeof rubric.title !== "string" ||
    !Array.isArray(rubric.criteria)
  ) {
    return false;
  }

  return rubric.criteria.every(
    (criterion) => {
      if (
        typeof criterion !== "object" ||
        criterion === null
      ) {
        return false;
      }

      const typedCriterion =
        criterion as Record<
          string,
          unknown
        >;

      return (
        typeof typedCriterion.criterion ===
          "string" &&
        typeof typedCriterion.excellent ===
          "string" &&
        typeof typedCriterion.good ===
          "string" &&
        typeof typedCriterion.regular ===
          "string" &&
        typeof typedCriterion.acceptable ===
          "string" &&
        typeof typedCriterion.improvable ===
          "string"
      );
    },
  );
}

function buildDurationPlanInstructions(
  data: AIFormData,
): string {
  const expectedMinutes =
    extractDurationMinutes(data.duration);

  const durationPlanIsRequired =
    requiresDurationPlan(data.toolId) &&
    expectedMinutes !== null;

  if (!durationPlanIsRequired) {
    return `
VALIDACIÓN TEMPORAL ESTRUCTURADA

- El campo "durationPlan" debe ser null.
- No inventes una distribución temporal estructurada.
`.trim();
  }

  return `
VALIDACIÓN TEMPORAL ESTRUCTURADA

- El campo "durationPlan" debe contener la distribución temporal completa.
- requestedMinutes debe ser exactamente ${expectedMinutes}.
- totalMinutes debe ser exactamente ${expectedMinutes}.
- blocks debe incluir un elemento por cada momento temporal principal.
- La suma matemática de blocks[].minutes debe ser exactamente ${expectedMinutes}.
- Los bloques deben coincidir con los tiempos escritos dentro de "sections".
- Cada minuto debe pertenecer a un solo bloque temporal; no solapes ni contabilices el mismo minuto en dos bloques diferentes.
- Si "Evaluación" tiene minutos propios en durationPlan, esos minutos deben ejecutarse íntegramente dentro del bloque de evaluación.
- La observación docente continua puede realizarse durante el desarrollo, pero no debe presentarse como parte de los minutos exclusivos del bloque de evaluación.
- No escribas que un minuto de evaluación ocurre "durante el desarrollo", "dentro del cierre" o "incluido en otro bloque".
- No escribas en las secciones ningún tiempo que contradiga durationPlan.
- Comprueba la suma y la ausencia de solapamientos antes de responder.
`.trim();
}

function buildGenerationInput(
  data: AIFormData,
  correctionMessage?: string,
): string {
  const parts = [
    buildPedagogicalPrompt(data),
    buildDurationPlanInstructions(data),
  ];

  if (correctionMessage) {
  const exactRequestedTopic =
    data.topic.trim();

  parts.push(`
CORRECCIÓN OBLIGATORIA DEL REINTENTO

La generación anterior fue rechazada por esta razón:

${correctionMessage}

ALCANCE TEMÁTICO CERRADO

- Tema autorizado: "${exactRequestedTopic}".
- Conserva literalmente este tema en el título, objetivo, actividades y evaluación.
- Desarrolla exclusivamente las habilidades o técnicas expresamente incluidas en el tema autorizado.
- No amplíes el contenido con técnicas relacionadas, variantes técnicas, fundamentos adicionales ni contenidos del mismo deporte que no hayan sido solicitados.
- Cualquier técnica mencionada dentro del mensaje de rechazo, pero ausente del tema autorizado, representa contenido prohibido que debes eliminar.
- No vuelvas a escribir las técnicas prohibidas, ni siquiera para compararlas, descartarlas o explicar que no serán utilizadas.

CORRECCIÓN METODOLÓGICA

- Si la herramienta es una planificación, incluye una sección titulada exactamente "Metodología aplicada".
- Identifica dentro de esa sección la metodología establecida en las instrucciones principales.
- En selección automática, utiliza solamente una o dos metodologías reconocidas en el catálogo proporcionado.
- Aplica la metodología en la organización, las actividades, los roles docente y estudiantil y la evaluación.
- No inventes nombres de metodologías ni los sustituyas por estrategias genéricas.

REVISIÓN FINAL OBLIGATORIA

- Genera nuevamente el contenido completo.
- Corrige todos los errores señalados en el mensaje de rechazo.
- Comprueba el título, objetivo, técnicas, tiempos, organización, materiales, metodología, evaluación, DUA y apoyos NEE antes de responder.
- No reproduzcas estas instrucciones ni el mensaje de rechazo en el contenido visible.
- No repitas ninguno de los errores anteriores.
`.trim());
}

  return parts.join("\n\n");
}

export async function POST(
  request: NextRequest,
) {
  const accessResult = await getAuthenticatedApiAccess("Profe IA");
  if (accessResult.error) return accessResult.error;

  const access = accessResult.access;
  let freeReservationActive = false;

  if (!process.env.OPENAI_API_KEY) {
    return createErrorResponse(
      "ProfeGPT no tiene configurada la clave de inteligencia artificial.",
      503,
    );
  }

  try {
    const rawBody = await request.text();

    if (rawBody.length > MAX_REQUEST_SIZE) {
      return createErrorResponse(
        "La solicitud supera el tamaño permitido.",
        413,
      );
    }

    let parsedBody: unknown;

    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return createErrorResponse(
        "La solicitud contiene información no válida.",
        400,
      );
    }

    if (!isValidAIFormData(parsedBody)) {
      return createErrorResponse(
        "Los datos enviados están incompletos o no son válidos.",
        400,
      );
    }

    if (parsedBody.toolId !== "lesson-plan" && !access.hasProAccess) {
      return createErrorResponse(
        "Esta herramienta pertenece al Plan Pro. La cuenta Free incluye Crear planificación.",
        403,
      );
    }

    if (parsedBody.toolId === "lesson-plan") {
      const reservation = await reserveFreeGeneration(
        access,
        "lesson-plan",
      );

      if (!reservation.allowed) {
        return createErrorResponse(
          reservation.message ?? "Alcanzaste el límite mensual del Plan Free.",
          429,
        );
      }

      freeReservationActive = reservation.reserved;
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    let lastValidationMessage =
      "La respuesta no superó la validación.";

    for (
      let attempt = 1;
      attempt <= MAX_GENERATION_ATTEMPTS;
      attempt += 1
    ) {
      const response =
        await client.responses.create({
          model:
            process.env.OPENAI_MODEL ??
            "gpt-5-mini",

          store: false,

          instructions:
            PROFE_GPT_INSTRUCTIONS,

          input: buildGenerationInput(
            parsedBody,
            attempt > 1
              ? lastValidationMessage
              : undefined,
          ),

          text: {
            format: {
              type: "json_schema",
              name: "profe_gpt_content",
              strict: true,
              schema:
                generatedContentSchema,
            },
          },
        });

      if (!response.output_text) {
        lastValidationMessage =
          "ProfeGPT no produjo contenido.";

        continue;
      }

      let generatedContent: unknown;

      try {
        generatedContent = JSON.parse(
          response.output_text,
        );
      } catch {
        lastValidationMessage =
          "La respuesta generada no pudo procesarse.";

        continue;
      }

      if (
        !isGeneratedAIContent(
          generatedContent,
        )
      ) {
        lastValidationMessage =
          "La respuesta no cumple la estructura requerida.";

        continue;
      }

      const normalizedContent =
        normalizeGeneratedContent(
          generatedContent,
          parsedBody.objectiveTaxonomy,
          parsedBody,
        );

      if (
        !isGeneratedAIContent(
          normalizedContent,
        )
      ) {
        lastValidationMessage =
          "La respuesta normalizada no cumple la estructura requerida.";

        continue;
      }

      const durationValidation =
        validateGeneratedDuration(
          parsedBody,
          normalizedContent,
        );

      const logisticsValidation =
  validateGeneratedLogistics(
    parsedBody,
    normalizedContent,
  );

  const rubricValidation =
  validateGeneratedRubric(
    parsedBody,
    normalizedContent,
  );

  const checklistValidation =
    validateGeneratedChecklist(
      parsedBody,
      normalizedContent,
    );


  const gameValidation =
    validateGeneratedGame(
      parsedBody,
      normalizedContent,
    );
const pedagogicalValidation =
  validateGeneratedPedagogy(
    parsedBody,
    normalizedContent,
  );

const methodologyValidation =
  validateGeneratedMethodology(
    parsedBody,
    normalizedContent,
  );

  const examValidation =
  validateGeneratedExam(
    parsedBody,
    normalizedContent,
  );

  const assessmentValidation =
  validateGeneratedAssessment(
    parsedBody,
    normalizedContent,
  );

  const objectiveValidation =
  validateGeneratedObjective(
    parsedBody,
    normalizedContent,
  );

  const duaAdaptationValidation =
  validateGeneratedDuaAdaptation(
    parsedBody,
    normalizedContent,
  );

const neeAdaptationValidation =
  validateGeneratedNeeAdaptation(
    parsedBody,
    normalizedContent,
  );

  const physicalCircuitValidation =
  validateGeneratedPhysicalCircuit(
    parsedBody,
    normalizedContent,
  );

const validationMessages: string[] =
  [];

      if (!durationValidation.valid) {
        validationMessages.push(
          durationValidation.message ??
            "La distribución temporal no es válida.",
        );
      }

      if (!logisticsValidation.valid) {
        validationMessages.push(
          logisticsValidation.message ??
            "La organización logística no es válida.",
        );
      }
if (!pedagogicalValidation.valid) {
  validationMessages.push(
    pedagogicalValidation.message ??
      "El contenido no mantiene una coherencia pedagógica válida.",
  );
}

if (!methodologyValidation.valid) {
  validationMessages.push(
    methodologyValidation.message ??
      "La planificación no aplica correctamente la metodología seleccionada.",
  );
}

if (!rubricValidation.valid) {
  validationMessages.push(
    rubricValidation.message ??
      "La rúbrica generada no es coherente.",
  );
}

if (!checklistValidation.valid) {
  validationMessages.push(
    checklistValidation.message ??
      "La lista de cotejo generada no es coherente.",
  );
}

if (!gameValidation.valid) {
  validationMessages.push(
    gameValidation.message ??
      "El juego generado no cumple la estructura pedagógica requerida.",
  );
}
if (!examValidation.valid) {
  validationMessages.push(
    examValidation.message ??
      "El examen generado no coincide con la configuración.",
  );
}
if (!assessmentValidation.valid) {
  validationMessages.push(
    assessmentValidation.message ??
      "La evaluación generada no utiliza correctamente la escala sobre 10 puntos.",
  );
}
if (!objectiveValidation.valid) {
  validationMessages.push(
    objectiveValidation.message ??
      "El objetivo de aprendizaje no corresponde con la taxonomía seleccionada.",
  );
}
if (!duaAdaptationValidation.valid) {
  validationMessages.push(
    duaAdaptationValidation.message ??
      "La adaptación DUA generada no cumple la estructura o las condiciones de inclusión requeridas.",
  );
}

if (!neeAdaptationValidation.valid) {
  validationMessages.push(
    neeAdaptationValidation.message ??
      "La adaptación NEE generada no cumple la estructura o las condiciones de inclusión requeridas.",
  );
}

if (!physicalCircuitValidation.valid) {
  validationMessages.push(
    physicalCircuitValidation.message ??
      "El circuito físico generado no cumple la estructura, la organización, los tiempos o las condiciones de seguridad requeridas.",
  );
}

if (validationMessages.length > 0) {
        lastValidationMessage =
          validationMessages.join(" ");

        console.warn(
          `[Profe IA] Intento ${attempt}: ${lastValidationMessage}`,
        );

        continue;
      }

      await recordCurrentUserActivity({
        type: "profe-ai",
        title: normalizedContent.title,
        description: `${parsedBody.topic} · ${parsedBody.grade}`,
        href: "/ai",
      });

      return NextResponse.json({
        success: true,
        data: normalizedContent,
      });
    }

    console.error(
      "[Profe IA] Validación agotada:",
      lastValidationMessage,
    );

    if (freeReservationActive) {
      await releaseFreeGeneration(access, "lesson-plan");
      freeReservationActive = false;
    }

    return createErrorResponse(
       "Profe IA no pudo producir un contenido completamente coherente con la configuración. Intenta generar nuevamente.",
      502,
    );
  } catch (error) {
    if (freeReservationActive) {
      await releaseFreeGeneration(access, "lesson-plan");
      freeReservationActive = false;
    }

    console.error(
      "========== ERROR OPENAI ==========",
    );
    console.error(error);

    if (error instanceof OpenAI.APIError) {
      console.error(
        "STATUS:",
        error.status,
      );
      console.error(
        "NAME:",
        error.name,
      );
      console.error(
        "MESSAGE:",
        error.message,
      );

      if (error.status === 401) {
        return createErrorResponse(
          "La clave configurada no es válida.",
          503,
        );
      }

      if (error.status === 429) {
        const errorCode =
          typeof error.code === "string"
            ? error.code
            : "unknown";

        console.error(
          "OPENAI 429 CODE:",
          errorCode,
        );

        console.error(
          "OPENAI 429 MESSAGE:",
          error.message,
        );

        if (
          errorCode ===
          "insufficient_quota"
        ) {
          return createErrorResponse(
            "La cuenta de OpenAI API no tiene cuota o saldo disponible. Revisa la facturación de la API.",
            429,
          );
        }

        return createErrorResponse(
          "Se alcanzó el límite de solicitudes de OpenAI. Espera unos minutos e intenta nuevamente.",
          429,
        );
      }

      if (
        error.status &&
        error.status >= 500
      ) {
        return createErrorResponse(
          "El servicio de inteligencia artificial no está disponible temporalmente.",
          503,
        );
      }
    }

    return createErrorResponse(
      "Ocurrió un error inesperado al generar el contenido.",
      500,
    );
  }
}
