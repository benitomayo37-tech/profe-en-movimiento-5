import type {
  AIFormData,
  AIPlanningMethodology,
  GeneratedAIContent,
} from "@/features/ai/types/ai";

export interface GeneratedMethodologyValidationResult {
  valid: boolean;
  message?: string;
}

const METHODOLOGY_NAME_PATTERNS: Record<
  Exclude<
    AIPlanningMethodology,
    "automatic" | "combined"
  >,
  RegExp
> = {
  "cooperative-learning":
    /APRENDIZAJE COOPERATIVO|METODOLOGIA COOPERATIVA/,
  gamification:
    /GAMIFICACION/,
  "game-based-learning":
    /APRENDIZAJE BASADO EN JUEGOS|\bABJ\b/,
  "problem-based-learning":
    /APRENDIZAJE BASADO EN PROBLEMAS|\bABP\b/,
  "project-based-learning":
    /APRENDIZAJE BASADO EN PROYECTOS|METODOLOGIA DE PROYECTOS/,
  "guided-discovery":
    /DESCUBRIMIENTO GUIADO/,
  "problem-solving":
    /RESOLUCION DE PROBLEMAS/,
  "reciprocal-teaching":
    /ENSENANZA RECIPROCA/,
  stations:
    /ESTACIONES DE APRENDIZAJE|TRABAJO POR ESTACIONES/,
  "task-circuit":
    /CIRCUITO DE TAREAS/,
  "flipped-classroom":
    /AULA INVERTIDA/,
  "direct-instruction":
    /INSTRUCCION DIRECTA/,
};

const APPLICATION_PATTERNS: Record<
  Exclude<
    AIPlanningMethodology,
    "automatic" | "combined"
  >,
  RegExp[]
> = {
  "cooperative-learning": [
    /INTERDEPENDENCIA|META COMPARTIDA/,
    /ROLES?|COORDINADOR|PORTAVOZ|OBSERVADOR/,
    /COEVALUACION|RESPONSABILIDAD INDIVIDUAL/,
  ],

  gamification: [
    /RETO|MISION|NIVEL/,
    /PUNTOS|LOGRO|PROGRESO/,
    /RETROALIMENTACION|EVIDENCIA/,
  ],

  "game-based-learning": [
    /JUEGO|RONDA/,
    /REGLAS?|VARIANTE/,
    /CRITERIO DE EXITO|TOMA DE DECISIONES/,
  ],

  "problem-based-learning": [
    /PROBLEMA|SITUACION PROBLEMATICA/,
    /PROPUESTA|HIPOTESIS|SOLUCION/,
    /PRUEBA|JUSTIFICA|REFLEXION/,
  ],

  "project-based-learning": [
    /PROYECTO|PRODUCTO FINAL|DEMOSTRACION FINAL/,
    /FASE|PLANIFICACION/,
    /PRESENTACION|EVIDENCIA|RUBRICA/,
  ],

  "guided-discovery": [
    /PREGUNTA|CONSIGNA|PISTA/,
    /EXPLORA|DESCUBRE|COMPARA/,
    /SOLUCION ENCONTRADA|REFLEXION/,
  ],

  "problem-solving": [
    /SITUACION ABIERTA|PROBLEMA MOTOR/,
    /DIFERENTES SOLUCIONES|VARIAS SOLUCIONES/,
    /PRUEBA|COMPARA|JUSTIFICA|AJUSTA/,
  ],

  "reciprocal-teaching": [
    /EJECUTANTE|OBSERVADOR/,
    /CAMBIO DE ROLES|INTERCAMBIO DE ROLES/,
    /COEVALUACION|RETROALIMENTACION ENTRE PARES/,
  ],

  stations: [
    /ESTACION/,
    /ROTACION/,
    /TIEMPO|MATERIALES|CRITERIO DE LOGRO/,
  ],

  "task-circuit": [
    /CIRCUITO/,
    /SECUENCIA|RECORRIDO/,
    /REPETICIONES|TIEMPO|TRANSICION/,
  ],

  "flipped-classroom": [
    /ANTES DE LA CLASE|PREVIO|RECURSO PREVIO/,
    /APLICACION PRACTICA|PRACTICA PRESENCIAL/,
    /QUIENES NO PUDIERON|ALTERNATIVA INICIAL/,
  ],

  "direct-instruction": [
    /EXPLICACION|DEMOSTRACION/,
    /PRACTICA GUIADA/,
    /PRACTICA AUTONOMA|RETROALIMENTACION/,
  ],
};

function normalizeText(
  value: string,
): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
}

function invalid(
  message: string,
): GeneratedMethodologyValidationResult {
  return {
    valid: false,
    message,
  };
}

function countNamedMethodologies(
  text: string,
): number {
  return Object.values(
    METHODOLOGY_NAME_PATTERNS,
  ).reduce(
    (total, pattern) =>
      total +
      (pattern.test(text) ? 1 : 0),
    0,
  );
}

function countApplicationEvidence(
  methodology: Exclude<
    AIPlanningMethodology,
    "automatic" | "combined"
  >,
  text: string,
): number {
  return APPLICATION_PATTERNS[
    methodology
  ].reduce(
    (total, pattern) =>
      total +
      (pattern.test(text) ? 1 : 0),
    0,
  );
}

type ConcretePlanningMethodology =
  Exclude<
    AIPlanningMethodology,
    "automatic" | "combined"
  >;

function extractDeclaredMethodologyNames(
  sectionContent: string[],
): string[] | null {
  for (const item of sectionContent) {
    const normalizedItem =
      normalizeText(item);

    const declarationMatch =
      normalizedItem.match(
        /^(?:METODOLOGIAS?|ENFOQUES?)(?:\s+(?:ELEGIDAS?|SELECCIONADAS?|UTILIZADAS?|APLICADAS?))?\s*:\s*(.+)$/,
      );

    if (!declarationMatch?.[1]) {
      continue;
    }

    const names =
      declarationMatch[1]
        .split(
          /\s*(?:\+|,|;|\/|\bY\b|\bE\b)\s*/,
        )
        .map((name) =>
          name
            .replace(/[.]+$/g, "")
            .trim(),
        )
        .filter(Boolean);

    return names.length > 0
      ? names
      : null;
  }

  return null;
}

function findDeclaredMethodologyId(
  declaredName: string,
): ConcretePlanningMethodology | null {
  const entries =
    Object.entries(
      METHODOLOGY_NAME_PATTERNS,
    ) as Array<
      [
        ConcretePlanningMethodology,
        RegExp,
      ]
    >;

  for (
    const [methodologyId, pattern] of
      entries
  ) {
    if (pattern.test(declaredName)) {
      return methodologyId;
    }
  }

  return null;
}

function validateDeclaredMethodologies(
  selectedMethodology:
    AIPlanningMethodology,
  sectionContent: string[],
): GeneratedMethodologyValidationResult {
  const declaredNames =
    extractDeclaredMethodologyNames(
      sectionContent,
    );

  if (!declaredNames) {
    return invalid(
      'La sección debe identificar las metodologías mediante el formato "Metodologías seleccionadas: [nombre]".',
    );
  }

  const declaredMethodologyIds =
    declaredNames.map(
      findDeclaredMethodologyId,
    );

  const unknownMethodologies =
    declaredNames.filter(
      (_, index) =>
        declaredMethodologyIds[
          index
        ] === null,
    );

  if (
    unknownMethodologies.length > 0
  ) {
    return invalid(
      `La planificación utiliza metodologías que no pertenecen al catálogo: ${unknownMethodologies.join(
        ", ",
      )}. Selecciona exclusivamente metodologías registradas en Profe IA.`,
    );
  }

  const validMethodologyIds =
    declaredMethodologyIds.filter(
      (
        methodologyId,
      ): methodologyId is ConcretePlanningMethodology =>
        methodologyId !== null,
    );

  const uniqueMethodologyIds =
    new Set(validMethodologyIds);

  if (
    uniqueMethodologyIds.size !==
    validMethodologyIds.length
  ) {
    return invalid(
      "La sección de metodología repite una misma metodología.",
    );
  }

  if (
    selectedMethodology ===
      "automatic" &&
    (
      uniqueMethodologyIds.size < 1 ||
      uniqueMethodologyIds.size > 2
    )
  ) {
    return invalid(
      "La selección automática debe utilizar una o dos metodologías válidas del catálogo.",
    );
  }

  if (
    selectedMethodology ===
      "combined" &&
    (
      uniqueMethodologyIds.size < 2 ||
      uniqueMethodologyIds.size > 3
    )
  ) {
    return invalid(
      "La metodología combinada debe utilizar entre dos y tres metodologías válidas del catálogo.",
    );
  }

  if (
    selectedMethodology !==
      "automatic" &&
    selectedMethodology !==
      "combined" &&
    (
      uniqueMethodologyIds.size !== 1 ||
      !uniqueMethodologyIds.has(
        selectedMethodology,
      )
    )
  ) {
    return invalid(
      "La planificación debe declarar únicamente la metodología seleccionada por el docente.",
    );
  }

  return {
    valid: true,
  };
}

export function validateGeneratedMethodology(
  formData: AIFormData,
  content: GeneratedAIContent,
): GeneratedMethodologyValidationResult {
  if (formData.toolId !== "lesson-plan") {
    return {
      valid: true,
    };
  }

    const selectedMethodology =
    formData.planningMethodology;

  const methodologySection =
    content.sections.find(
      (section) => {
        const normalizedTitle =
          normalizeText(
            section.title,
          );

        const normalizedSection =
          normalizeText(
            [
              section.title,
              ...section.content,
            ].join(" "),
          );

        if (
          normalizedTitle.includes(
            "METODOLOG",
          )
        ) {
          return true;
        }

        if (
          selectedMethodology ===
            "automatic"
        ) {
          return (
            countNamedMethodologies(
              normalizedSection,
            ) >= 1
          );
        }

        if (
          selectedMethodology ===
            "combined"
        ) {
          return (
            countNamedMethodologies(
              normalizedSection,
            ) >= 2
          );
        }

        return METHODOLOGY_NAME_PATTERNS[
          selectedMethodology
        ].test(normalizedSection);
      },
    );

  if (!methodologySection) {
    return invalid(
      "La planificación no identifica claramente la metodología utilizada.",
    );
  }

  const methodologySectionIndex =
  content.sections.indexOf(
    methodologySection,
  );

const organizationSectionIndex =
  content.sections.findIndex(
    (section) =>
      normalizeText(
        section.title,
      ).includes(
        "ORGANIZACION DEL GRUPO",
      ),
  );

const startSectionIndex =
  content.sections.findIndex(
    (section) => {
      const normalizedTitle =
        normalizeText(
          section.title,
        );

      return (
        normalizedTitle === "INICIO" ||
        /^\d+[.)]\s*INICIO\b/.test(
          normalizedTitle,
        )
      );
    },
  );

if (
  organizationSectionIndex < 0 ||
  startSectionIndex < 0 ||
  methodologySectionIndex <=
    organizationSectionIndex ||
  methodologySectionIndex >=
    startSectionIndex
) {
  return invalid(
    'La sección "Metodología aplicada" debe ubicarse después de la organización y antes del inicio.',
  );
}

  const methodologyText =
    normalizeText(
      methodologySection.content.join(
        " ",
      ),
    );

  if (methodologyText.length < 80) {
    return invalid(
      "La sección de metodología no explica suficientemente su aplicación.",
    );
  }

    const declaredMethodologiesValidation =
    validateDeclaredMethodologies(
      selectedMethodology,
      methodologySection.content,
    );

  if (
    !declaredMethodologiesValidation.valid
  ) {
    return declaredMethodologiesValidation;
  }

  const fullText = normalizeText(
    [
      content.title,
      content.introduction,
      ...content.sections.flatMap(
        (section) => [
          section.title,
          ...section.content,
        ],
      ),
    ].join(" "),
  );

  const organizationIsApplied =
    /ORGANIZACION|ORGANIZA|DISTRIBUYE|GRUPOS|EQUIPOS|PAREJAS|ESTACIONES|CIRCUITO/.test(
      fullText,
    );

  if (!organizationIsApplied) {
    return invalid(
      "La planificación no aplica la metodología en la organización del grupo o del espacio.",
    );
  }

    const teacherIsMentioned =
    /\bDOCENTE\b|\bPROFESOR\b|\bPROFESORA\b/.test(
      fullText,
    );

  const teacherActionIsDefined =
    /GUIA|ORIENTA|FACILITA|DEMUESTRA|EXPLICA|SUPERVISA|RETROALIMENTA|OBSERVA|MODELA|ORGANIZA|ACOMPANA|CORRIGE|FORMULA|REGULA/.test(
      fullText,
    );

  if (
    !teacherIsMentioned ||
    !teacherActionIsDefined
  ) {
    return invalid(
      "La planificación no define el rol docente de acuerdo con la metodología.",
    );
  }

    const studentsAreMentioned =
    /ESTUDIANTE|ESTUDIANTES|ALUMNO|ALUMNOS|PARTICIPANTE|PARTICIPANTES/.test(
      fullText,
    );

  const studentActionIsDefined =
    /EJECUTA|EXPLORA|PROPONE|OBSERVA|PARTICIPA|PRACTICA|RESUELVE|TRABAJA|INVESTIGA|COLABORA|ANALIZA|INTERCAMBIA|RETROALIMENTA|ROTA/.test(
      fullText,
    );

  if (
    !studentsAreMentioned ||
    !studentActionIsDefined
  ) {
    return invalid(
      "La planificación no define el rol activo del estudiantado.",
    );
  }

  const evaluationIsApplied =
    /EVALUACION|COEVALUACION|AUTOEVALUACION|RETROALIMENTACION|CRITERIO|INDICADOR|EVIDENCIA/.test(
      fullText,
    );

  if (!evaluationIsApplied) {
    return invalid(
      "La evaluación no es coherente con la metodología seleccionada.",
    );
  }

  if (selectedMethodology === "automatic") {
    if (
      countNamedMethodologies(
        methodologyText,
      ) < 1
    ) {
      return invalid(
        "La selección automática no identificó claramente la metodología elegida.",
      );
    }

    return {
      valid: true,
    };
  }

  if (selectedMethodology === "combined") {
    if (
      countNamedMethodologies(
        methodologyText,
      ) < 2
    ) {
      return invalid(
        "La metodología combinada debe identificar al menos dos metodologías compatibles.",
      );
    }

    return {
      valid: true,
    };
  }

  if (
    !METHODOLOGY_NAME_PATTERNS[
      selectedMethodology
    ].test(methodologyText)
  ) {
    return invalid(
      "La planificación no identifica la metodología seleccionada.",
    );
  }

  if (
    countApplicationEvidence(
      selectedMethodology,
      fullText,
    ) < 2
  ) {
    return invalid(
      "La planificación menciona la metodología, pero no la aplica suficientemente en sus actividades.",
    );
  }

  return {
    valid: true,
  };
}