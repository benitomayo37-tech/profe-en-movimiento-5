import type { MovementExercise } from "../types";

export const olderAdultsExercises: MovementExercise[] = [
  {
    id: "older-adults-chair-stand",
    title: "Sentarse y levantarse de una silla",
    audience: "older-adults",
    contentType: "exercise",
    objective:
      "Fortalecer principalmente las piernas y practicar una acción funcional necesaria para la vida cotidiana.",
    goals: ["strength", "functional-autonomy"],
    difficulty: "basic",
    materials: ["Silla firme y estable"],
    instructions: [
      "Utiliza una silla firme y estable, preferiblemente colocada contra una pared.",
      "Siéntate cerca del borde delantero de la silla.",
      "Coloca los pies firmemente en el suelo.",
      "Inclina ligeramente el tronco hacia delante.",
      "Empuja con las piernas para ponerte de pie.",
      "Mantén una posición estable durante unos segundos.",
      "Lleva lentamente las caderas hacia atrás y vuelve a sentarte de forma controlada.",
    ],
    benefits: [
      "Favorece la fuerza de las piernas.",
      "Practica una acción funcional cotidiana.",
      "Puede contribuir al mantenimiento de la autonomía funcional.",
    ],
    adaptations: [
      "Utilizar inicialmente el apoyo de los brazos si resulta necesario.",
      "Utilizar una silla de mayor altura para disminuir la dificultad.",
      "Realizar el ejercicio con supervisión o apoyo cercano si existe inseguridad al ponerse de pie.",
    ],
    safety: [
      "Comprueba que la silla sea estable antes de comenzar.",
      "Evita superficies resbaladizas.",
      "Mantén un apoyo cercano cuando exista riesgo de pérdida del equilibrio.",
    ],
    stopIf: [
      "Aparece dolor intenso o repentino.",
      "Aparece mareo importante o sensación de desmayo.",
      "Se presenta dolor o presión en el pecho.",
      "La persona pierde estabilidad y no puede continuar de forma segura.",
    ],
  },

  {
    id: "older-adults-march-in-place",
    title: "Marcha en el lugar",
    audience: "older-adults",
    contentType: "exercise",
    objective:
      "Estimular la movilidad, coordinación y resistencia mediante una actividad sencilla y adaptable.",
    goals: ["endurance", "coordination", "mobility"],
    difficulty: "basic",
    materials: ["Superficie estable y espacio despejado"],
    instructions: [
      "Colócate de pie junto a una superficie estable.",
      "Eleva alternativamente un pie y después el otro.",
      "Mantén un ritmo cómodo y controlado.",
      "Coordina suavemente los brazos si resulta seguro.",
      "Continúa durante un tiempo que puedas tolerar cómodamente.",
    ],
    benefits: [
      "Favorece la movilidad.",
      "Estimula la coordinación.",
      "Puede contribuir al desarrollo de la resistencia.",
    ],
    adaptations: [
      "Realizar la actividad sentado elevando alternativamente las rodillas.",
      "Reducir el ritmo o la amplitud del movimiento.",
      "Utilizar un apoyo estable si existe inseguridad al permanecer de pie.",
    ],
    safety: [
      "Mantén un apoyo cercano cuando exista riesgo de pérdida del equilibrio.",
      "Utiliza un espacio despejado.",
      "Prioriza el control del movimiento sobre la velocidad.",
    ],
    stopIf: [
      "Aparece mareo intenso.",
      "Aparece dolor o presión en el pecho.",
      "Se presenta dificultad respiratoria importante o diferente a la habitual.",
      "Aparece dolor intenso o repentino.",
    ],
  },

  {
    id: "older-adults-heel-raise",
    title: "Elevación de talones",
    audience: "older-adults",
    contentType: "exercise",
    objective:
      "Fortalecer la musculatura de la pantorrilla y practicar el control postural.",
    goals: ["strength", "balance", "functional-autonomy"],
    difficulty: "basic",
    materials: ["Silla firme o superficie estable de apoyo"],
    instructions: [
      "Colócate detrás de una silla firme.",
      "Sujétate ligeramente con las manos.",
      "Eleva lentamente los talones.",
      "Mantén la posición brevemente si resulta cómodo.",
      "Desciende de manera lenta y controlada.",
    ],
    benefits: [
      "Favorece el fortalecimiento de los miembros inferiores.",
      "Trabaja el control postural.",
      "Contribuye a mantener capacidades necesarias para actividades cotidianas.",
    ],
    adaptations: [
      "Realizarlo sentado si permanecer de pie resulta inseguro.",
      "Reducir la amplitud del movimiento.",
      "Mantener mayor apoyo de las manos cuando sea necesario.",
    ],
    safety: [
      "No utilices una silla con ruedas como apoyo.",
      "Mantén el apoyo estable durante toda la actividad si lo necesitas.",
      "Evita movimientos rápidos o bruscos.",
    ],
    stopIf: [
      "Aparece dolor intenso.",
      "Aparece mareo o pérdida de estabilidad.",
      "La persona no puede mantener una posición segura.",
    ],
  },

  {
    id: "older-adults-lateral-weight-shift",
    title: "Transferencia de peso lateral",
    audience: "older-adults",
    contentType: "exercise",
    objective:
      "Practicar el control del peso corporal durante desplazamientos laterales.",
    goals: ["balance", "coordination", "functional-autonomy"],
    difficulty: "basic",
    materials: ["Superficie estable de apoyo"],
    instructions: [
      "Permanece de pie frente a una superficie estable.",
      "Separa ligeramente los pies.",
      "Traslada lentamente el peso hacia el lado derecho.",
      "Regresa al centro de forma controlada.",
      "Traslada el peso hacia el lado izquierdo.",
      "Repite manteniendo siempre una posición estable.",
    ],
    benefits: [
      "Favorece el control postural.",
      "Trabaja el equilibrio.",
      "Practica desplazamientos del peso corporal.",
    ],
    adaptations: [
      "Mantener ambas manos apoyadas.",
      "Reducir el desplazamiento lateral.",
      "Realizarlo sentado si permanecer de pie no es seguro.",
    ],
    safety: [
      "Realiza el ejercicio junto a una superficie estable.",
      "No retires el apoyo si la persona todavía necesita utilizarlo.",
      "Prioriza la estabilidad sobre la amplitud del movimiento.",
    ],
    stopIf: [
      "Aparece pérdida importante del equilibrio.",
      "Aparece mareo.",
      "Aparece dolor intenso.",
    ],
  },

  {
    id: "older-adults-heel-to-toe-walk",
    title: "Marcha talón-punta",
    audience: "older-adults",
    contentType: "exercise",
    objective:
      "Trabajar el control postural y la coordinación durante la marcha.",
    goals: ["balance", "coordination", "functional-autonomy"],
    difficulty: "intermediate",
    materials: ["Espacio despejado y apoyo estable cercano"],
    instructions: [
      "Colócate cerca de una pared o superficie estable.",
      "Da un paso colocando el talón delante.",
      "Acerca el otro pie de forma controlada.",
      "Continúa lentamente mientras mantienes el control postural.",
    ],
    benefits: [
      "Estimula el equilibrio.",
      "Favorece la coordinación durante la marcha.",
      "Practica el control del cuerpo durante desplazamientos.",
    ],
    adaptations: [
      "Realizar pasos más amplios.",
      "Utilizar apoyo cercano.",
      "Practicar inicialmente con supervisión.",
    ],
    safety: [
      "No realizar sin apoyo cercano si existe riesgo de caída.",
      "No utilizar esta actividad como reto de velocidad.",
      "Detener la actividad si la persona pierde estabilidad.",
    ],
    stopIf: [
      "Aparece pérdida de equilibrio.",
      "Aparece mareo.",
      "La persona necesita apoyo adicional para mantenerse segura.",
    ],
  },

  {
    id: "older-adults-wall-push",
    title: "Empuje contra la pared",
    audience: "older-adults",
    contentType: "exercise",
    objective:
      "Fortalecer brazos, hombros y pecho utilizando la pared como apoyo.",
    goals: ["strength", "functional-autonomy"],
    difficulty: "basic",
    materials: ["Pared firme"],
    instructions: [
      "Colócate frente a una pared.",
      "Apoya las manos aproximadamente a la altura de los hombros.",
      "Mantén el cuerpo alineado de forma cómoda.",
      "Flexiona lentamente los codos acercando el cuerpo a la pared.",
      "Empuja suavemente para regresar a la posición inicial.",
    ],
    benefits: [
      "Favorece el fortalecimiento de brazos y hombros.",
      "Trabaja la musculatura del pecho.",
      "Permite realizar un ejercicio de fuerza con una carga adaptable.",
    ],
    adaptations: [
      "Acercarse más a la pared para disminuir la dificultad.",
      "Reducir la amplitud del movimiento.",
      "Realizar el ejercicio con supervisión cuando sea necesario.",
    ],
    safety: [
      "Utiliza una pared firme.",
      "Evita bloquear los codos.",
      "Respira normalmente durante el movimiento.",
      "No realices movimientos bruscos.",
    ],
    stopIf: [
      "Aparece dolor intenso.",
      "Aparece dolor o presión en el pecho.",
      "Aparece dificultad respiratoria importante.",
    ],
  },

  {
    id: "older-adults-seated-knee-extension",
    title: "Extensión de rodilla sentado",
    audience: "older-adults",
    contentType: "exercise",
    objective:
      "Activar y fortalecer de forma suave la musculatura anterior del muslo.",
    goals: ["strength", "mobility"],
    difficulty: "basic",
    materials: ["Silla firme y estable"],
    instructions: [
      "Siéntate en una silla firme.",
      "Mantén una postura cómoda y estable.",
      "Extiende lentamente una pierna.",
      "Mantén la posición brevemente si resulta cómodo.",
      "Baja la pierna de forma controlada.",
      "Alterna las piernas.",
    ],
    benefits: [
      "Favorece la activación de los músculos de las piernas.",
      "Puede contribuir al mantenimiento de la movilidad.",
      "Permite trabajar sentado cuando permanecer de pie no resulta adecuado.",
    ],
    adaptations: [
      "Reducir el recorrido de la extensión.",
      "Realizar el movimiento más lentamente.",
      "Detener el movimiento antes de que aparezca dolor.",
    ],
    safety: [
      "Utiliza una silla estable.",
      "Evita movimientos bruscos.",
      "El movimiento debe realizarse dentro de un rango cómodo.",
    ],
    stopIf: [
      "Aparece dolor intenso o repentino.",
      "Aparece una molestia que empeora durante el movimiento.",
      "La persona pierde estabilidad en la silla.",
    ],
  },

  {
    id: "older-adults-active-walk",
    title: "Caminata activa",
    audience: "older-adults",
    contentType: "exercise",
    objective:
      "Favorecer la resistencia y la movilidad mediante una actividad aeróbica cotidiana y adaptable.",
    goals: ["endurance", "mobility", "functional-autonomy"],
    difficulty: "basic",
    materials: ["Calzado adecuado y espacio seguro"],
    instructions: [
      "Elige una ruta segura y conocida.",
      "Comienza caminando tranquilamente.",
      "Aumenta progresivamente el ritmo según tu capacidad.",
      "Mantén una intensidad que puedas tolerar cómodamente.",
      "Finaliza reduciendo progresivamente el ritmo.",
    ],
    benefits: [
      "Favorece la resistencia.",
      "Estimula la movilidad cotidiana.",
      "Puede integrarse fácilmente en las actividades diarias.",
    ],
    adaptations: [
      "Comenzar con períodos cortos de caminata.",
      "Alternar caminata y pausas.",
      "Realizar la actividad acompañado cuando exista riesgo de caída.",
      "Utilizar una alternativa sentada si caminar no es seguro o posible.",
    ],
    safety: [
      "Utiliza calzado estable y apropiado.",
      "Elige superficies seguras y despejadas.",
      "Considera realizar la actividad acompañado si existe riesgo de caída.",
      "Mantén una intensidad acorde con tu capacidad actual.",
    ],
    stopIf: [
      "Aparece dolor o presión en el pecho.",
      "Aparece dificultad respiratoria importante o diferente a la habitual.",
      "Aparece mareo intenso o sensación de desmayo.",
      "Aparece dolor intenso o repentino.",
    ],
  },
];

export const olderAdultsFlexibility = [
  {
    id: "older-adults-neck-mobility",
    title: "Movilidad suave de cuello",
    description:
      "Movimientos lentos y cómodos dentro del rango disponible, sin forzar ni provocar dolor.",
  },
  {
    id: "older-adults-shoulder-mobility",
    title: "Movilidad de hombros",
    description:
      "Movimientos suaves de los hombros para favorecer la movilidad de la cintura escapular.",
  },
  {
    id: "older-adults-ankle-mobility",
    title: "Movilidad de tobillos",
    description:
      "Flexión y extensión suave de los tobillos, sentado o en una posición estable.",
  },
  {
    id: "older-adults-wrist-mobility",
    title: "Movilidad de muñecas",
    description:
      "Movimientos suaves de las muñecas dentro de un rango cómodo.",
  },
  {
    id: "older-adults-calf-stretch",
    title: "Estiramiento suave de pantorrillas",
    description:
      "Estiramiento progresivo y cómodo de la pantorrilla, evitando rebotes y dolor.",
  },
];

export const olderAdultsFallPrevention = {
  title: "Prevención de caídas",
  description:
    "El trabajo de fuerza, equilibrio y capacidad funcional puede formar parte de una estrategia de prevención de caídas. También es importante prestar atención al entorno y a otros factores personales.",
  recommendations: [
    "Practicar ejercicios de fuerza de piernas.",
    "Incluir actividades de equilibrio adaptadas a la capacidad de la persona.",
    "Mantener espacios de paso despejados y bien iluminados.",
    "Utilizar calzado adecuado y estable.",
    "Revisar la visión cuando corresponda.",
    "Consultar con un profesional sanitario sobre medicamentos u otros factores que puedan aumentar el riesgo de caídas.",
  ],
};

export const olderAdultsSafety = {
  title: "Seguridad para adultos mayores",
  recommendations: [
    "Comienza con una actividad acorde con tu capacidad actual y progresa de manera gradual.",
    "Prepara un espacio despejado y seguro antes de comenzar.",
    "Utiliza ropa y calzado adecuados para la actividad.",
    "Mantén agua disponible cuando corresponda.",
    "Si llevas tiempo inactivo o tienes una condición de salud que pueda afectar tu actividad, consulta con un profesional sanitario sobre el tipo y nivel de ejercicio apropiados.",
    "Prioriza la calidad y el control del movimiento sobre la velocidad o la cantidad.",
  ],
  stopIf: [
    "Dolor intenso o que aparece de forma repentina.",
    "Dolor o presión en el pecho.",
    "Dificultad respiratoria importante o diferente a la habitual.",
    "Mareo intenso, desmayo o pérdida de conciencia.",
    "Debilidad repentina o empeoramiento brusco del estado general.",
    "Una situación que haga inseguro continuar.",
  ],
};
