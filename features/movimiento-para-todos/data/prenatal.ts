import type { MovementExercise } from "../types";

export const prenatalExercises: MovementExercise[] = [
  {
    id: "prenatal-comfortable-walk",
    title: "Caminata a ritmo cómodo",
    audience: "prenatal",
    contentType: "exercise",
    objective:
      "Favorecer la actividad física aeróbica de intensidad cómoda a moderada mediante una propuesta sencilla, progresiva y adaptable durante el embarazo.",
    goals: ["endurance", "functional-autonomy", "gentle-activity"],
    difficulty: "basic",
    materials: ["Calzado cómodo", "Superficie segura, estable y despejada"],
    instructions: [
      "Elige una superficie segura, estable, despejada y, cuando sea posible, bien iluminada.",
      "Comienza caminando a un ritmo cómodo y aumenta progresivamente según tu tolerancia.",
      "Mantén una respiración regular y un esfuerzo que te permita hablar con relativa comodidad.",
      "Utiliza recorridos cortos o pausas si lo necesitas.",
      "Ajusta la duración y el ritmo según tu experiencia previa de actividad física y las indicaciones de tu equipo sanitario.",
    ],
    benefits: [
      "Favorece la actividad física aeróbica durante el embarazo.",
      "Puede ayudar a reducir períodos prolongados de inactividad.",
      "Es una actividad sencilla que puede adaptarse a diferentes niveles de capacidad.",
    ],
    adaptations: [
      "Comenzar con períodos breves de caminata y aumentar gradualmente.",
      "Realizar varias caminatas cortas durante el día si resulta más cómodo.",
      "Reducir el ritmo o realizar pausas cuando aparezca fatiga excesiva.",
      "Utilizar una superficie interior segura como alternativa cuando las condiciones exteriores no sean adecuadas.",
    ],
    safety: [
      "Evita ambientes excesivamente calurosos y procura mantener una hidratación adecuada.",
      "Utiliza calzado cómodo y una superficie que reduzca el riesgo de caídas.",
      "Evita aumentar bruscamente la duración o intensidad.",
      "Respeta cualquier restricción o recomendación específica indicada por tu equipo sanitario.",
    ],
    stopIf: [
      "Aparece sangrado vaginal.",
      "Se produce pérdida de líquido.",
      "Aparecen contracciones dolorosas o regulares.",
      "Aparece dolor en el pecho, mareo intenso, desmayo o dificultad respiratoria importante o inesperada.",
      "Aparece debilidad que compromete el equilibrio o un malestar importante.",
    ],
    contraindications: [
      "No iniciar o aumentar la actividad sin valoración sanitaria cuando exista una contraindicación médica u obstétrica conocida.",
      "Si aparecen síntomas nuevos o preocupantes durante la actividad, detenerse y solicitar orientación sanitaria.",
    ],
  },

  {
    id: "prenatal-chair-stand",
    title: "Sentarse y levantarse de una silla",
    audience: "prenatal",
    contentType: "exercise",
    objective:
      "Favorecer la fuerza funcional de los miembros inferiores y practicar una acción cotidiana mediante un movimiento controlado y adaptable.",
    goals: ["strength", "functional-autonomy"],
    difficulty: "basic",
    materials: ["Silla firme y estable"],
    instructions: [
      "Coloca una silla firme y estable, preferiblemente contra una pared.",
      "Siéntate cerca del borde delantero de la silla con los pies firmemente apoyados.",
      "Inclina ligeramente el tronco hacia delante y empuja con las piernas para ponerte de pie.",
      "Mantén una posición estable durante unos segundos.",
      "Lleva lentamente las caderas hacia atrás y vuelve a sentarte de forma controlada.",
      "Respira de forma regular y realiza solo las repeticiones que puedas completar con seguridad.",
    ],
    benefits: [
      "Favorece la fuerza funcional de las piernas.",
      "Practica una acción cotidiana relacionada con la autonomía.",
      "Permite ajustar fácilmente la dificultad mediante la altura de la silla y el número de repeticiones.",
    ],
    adaptations: [
      "Utilizar inicialmente el apoyo de los brazos si resulta necesario.",
      "Utilizar una silla de mayor altura para disminuir la dificultad.",
      "Reducir el número de repeticiones y aumentar progresivamente según tolerancia.",
      "Realizar el ejercicio cerca de una superficie estable si existe inseguridad.",
    ],
    safety: [
      "Comprueba que la silla sea estable antes de comenzar.",
      "Evita superficies resbaladizas.",
      "Realiza el movimiento lentamente y sin impulsos bruscos.",
      "Mantén una base de apoyo estable y evita posiciones que comprometan el equilibrio.",
    ],
    stopIf: [
      "Aparece dolor intenso o repentino.",
      "Aparece sangrado vaginal o pérdida de líquido.",
      "Se presentan mareo importante, sensación de desmayo o pérdida de estabilidad.",
      "Aparecen dolor en el pecho o dificultad respiratoria importante.",
    ],
    contraindications: [
      "No realizar sin valoración sanitaria si existe una condición médica u obstétrica que limite de forma importante la movilidad o el esfuerzo.",
    ],
  },

  {
    id: "prenatal-ankle-foot-mobility",
    title: "Movilidad de tobillos y pies",
    audience: "prenatal",
    contentType: "exercise",
    objective:
      "Favorecer el movimiento de tobillos y pies mediante una propuesta suave que pueda realizarse sentada y adaptarse a la tolerancia individual.",
    goals: ["mobility", "functional-autonomy", "gentle-activity"],
    difficulty: "basic",
    materials: ["Silla estable"],
    instructions: [
      "Siéntate en una silla estable con la espalda cómoda y los pies apoyados.",
      "Eleva ligeramente un pie si te resulta cómodo.",
      "Realiza movimientos lentos de flexión y extensión del tobillo.",
      "Puedes realizar círculos suaves con el tobillo dentro de un rango cómodo.",
      "Cambia de lado y repite.",
      "Mantén una respiración tranquila y evita movimientos bruscos.",
    ],
    benefits: [
      "Favorece la movilidad de los tobillos.",
      "Permite realizar movimiento suave con una demanda física baja.",
      "Puede incorporarse durante pausas de actividad o períodos de sedestación.",
    ],
    adaptations: [
      "Realizar todos los movimientos con los pies apoyados si elevarlos resulta incómodo.",
      "Reducir la amplitud del movimiento.",
      "Realizar pocas repeticiones y aumentar gradualmente según tolerancia.",
      "Utilizar una silla con respaldo estable.",
    ],
    safety: [
      "Realiza movimientos suaves y dentro de un rango cómodo.",
      "Evita forzar una articulación dolorosa.",
      "Mantén la silla estable y los pies libres de obstáculos.",
    ],
    stopIf: [
      "Aparece dolor intenso o repentino.",
      "Aparece hinchazón importante o nueva en una sola pierna.",
      "Aparece mareo intenso, desmayo o malestar importante.",
      "Aparecen otros síntomas que tu equipo sanitario haya indicado como motivo para detener la actividad.",
    ],
    contraindications: [
      "Si existe dolor o hinchazón inexplicada, especialmente unilateral, no utilices el ejercicio como forma de tratar el síntoma y solicita valoración sanitaria.",
    ],
  },

  {
    id: "prenatal-spine-pelvis-mobility",
    title: "Movilidad suave de columna y pelvis",
    audience: "prenatal",
    contentType: "exercise",
    objective:
      "Favorecer una movilidad suave y consciente de la columna y la pelvis utilizando posiciones cómodas y adaptables durante el embarazo.",
    goals: ["mobility", "coordination", "gentle-activity"],
    difficulty: "basic",
    materials: ["Esterilla o superficie cómoda", "Silla estable opcional"],
    instructions: [
      "Adopta una posición cómoda y estable que no genere presión ni molestias.",
      "Puedes realizar movimientos suaves de inclinación y retorno del tronco sentado o de pie con apoyo.",
      "Mueve la pelvis dentro de un rango pequeño y confortable.",
      "Coordina el movimiento con una respiración tranquila.",
      "Evita amplitudes extremas, rebotes y movimientos rápidos.",
      "Si una posición en el suelo resulta incómoda, realiza una alternativa sentada o de pie con apoyo.",
    ],
    benefits: [
      "Favorece la movilidad de la columna y la pelvis.",
      "Permite explorar movimientos suaves sin necesidad de utilizar cargas externas.",
      "Puede contribuir al confort y a la conciencia corporal.",
    ],
    adaptations: [
      "Realizar los movimientos sentada en una silla estable.",
      "Reducir la amplitud del movimiento.",
      "Utilizar una superficie de apoyo para mejorar la estabilidad.",
      "Evitar cualquier posición que genere mareo, dolor o incomodidad.",
    ],
    safety: [
      "No permanezcas acostada boca arriba durante períodos prolongados, especialmente después de las primeras semanas del embarazo.",
      "Evita posiciones inestables y movimientos extremos.",
      "Realiza transiciones entre posiciones lentamente.",
      "Si una posición produce mareo o malestar, cambia de posición y detén la actividad si el síntoma persiste.",
    ],
    stopIf: [
      "Aparece dolor intenso o repentino.",
      "Aparece sangrado vaginal o pérdida de líquido.",
      "Se presentan contracciones dolorosas o regulares.",
      "Aparecen mareo intenso, desmayo, dolor en el pecho o dificultad respiratoria importante.",
    ],
    contraindications: [
      "No realizar una posición o movimiento que haya sido desaconsejado específicamente por el equipo sanitario.",
    ],
  },

  {
    id: "prenatal-wall-push",
    title: "Empuje contra la pared",
    audience: "prenatal",
    contentType: "exercise",
    objective:
      "Favorecer el mantenimiento de la fuerza de brazos, hombros y tronco mediante un ejercicio estable y fácilmente adaptable.",
    goals: ["strength", "coordination", "functional-autonomy"],
    difficulty: "basic",
    materials: ["Pared firme y estable"],
    instructions: [
      "Colócate frente a una pared firme y estable.",
      "Apoya las manos a una altura cómoda y separa ligeramente los pies.",
      "Flexiona lentamente los codos y acerca el cuerpo hacia la pared.",
      "Empuja suavemente con los brazos para regresar a la posición inicial.",
      "Mantén el movimiento controlado y respira de forma regular.",
      "Realiza un número de repeticiones que puedas completar con comodidad.",
    ],
    benefits: [
      "Favorece el mantenimiento de la fuerza de los miembros superiores.",
      "Permite trabajar con una resistencia fácilmente adaptable.",
      "No requiere equipamiento especializado.",
    ],
    adaptations: [
      "Acercar los pies a la pared para disminuir la dificultad.",
      "Reducir el número de repeticiones.",
      "Realizar pausas entre series.",
      "Utilizar una posición más vertical si el equilibrio o la comodidad lo requieren.",
    ],
    safety: [
      "Comprueba que la pared sea estable.",
      "Mantén los pies firmemente apoyados.",
      "Evita contener voluntariamente la respiración.",
      "Realiza el movimiento lentamente y sin rebotes.",
    ],
    stopIf: [
      "Aparece dolor en el pecho.",
      "Aparece dificultad respiratoria importante o inesperada.",
      "Se presenta mareo intenso o sensación de desmayo.",
      "Aparece dolor agudo en hombros, brazos o espalda.",
    ],
    contraindications: [
      "Evitar si existe una lesión aguda o una condición médica u obstétrica que haga inseguro realizar el movimiento.",
    ],
  },

  {
    id: "prenatal-band-row",
    title: "Remo con banda elástica ligera",
    audience: "prenatal",
    contentType: "exercise",
    objective:
      "Favorecer la fuerza de la musculatura de la espalda y los brazos mediante una resistencia ligera y un movimiento controlado.",
    goals: ["strength", "coordination", "functional-autonomy"],
    difficulty: "basic",
    materials: ["Banda elástica ligera y en buen estado"],
    instructions: [
      "Siéntate o permanece de pie en una posición estable y cómoda.",
      "Sujeta la banda con ambas manos y mantén los hombros relajados.",
      "Lleva suavemente los codos hacia atrás, aproximándolos al tronco.",
      "Regresa lentamente a la posición inicial.",
      "Mantén una postura cómoda y respira de forma regular.",
      "Utiliza una resistencia que permita controlar todo el movimiento.",
    ],
    benefits: [
      "Favorece el mantenimiento de la fuerza de espalda y brazos.",
      "Permite ajustar fácilmente la resistencia.",
      "Puede realizarse sentado o de pie según las necesidades individuales.",
    ],
    adaptations: [
      "Realizar el ejercicio sentada para aumentar la estabilidad.",
      "Utilizar una banda de menor resistencia.",
      "Reducir el recorrido del movimiento.",
      "Realizar menos repeticiones y aumentar progresivamente según tolerancia.",
    ],
    safety: [
      "Comprueba que la banda esté en buen estado y no presente daños.",
      "No ancles la banda a un punto inseguro.",
      "Evita movimientos bruscos o tirones.",
      "No contengas voluntariamente la respiración.",
    ],
    stopIf: [
      "Aparece dolor intenso o repentino.",
      "Aparece dolor en el pecho o dificultad respiratoria importante.",
      "Se presenta mareo intenso o sensación de desmayo.",
      "Aparece dolor agudo en hombros, brazos o espalda.",
    ],
    contraindications: [
      "No realizar si existe una lesión aguda o una condición médica u obstétrica que limite el trabajo de fuerza.",
    ],
  },

  {
    id: "prenatal-supported-leg-raise",
    title: "Elevación lateral de pierna con apoyo",
    audience: "prenatal",
    contentType: "exercise",
    objective:
      "Favorecer la fuerza y el control de los miembros inferiores mediante un movimiento lateral suave con apoyo estable.",
    goals: ["strength", "balance", "functional-autonomy"],
    difficulty: "basic",
    materials: ["Silla firme o superficie estable para apoyo"],
    instructions: [
      "Colócate junto a una silla firme o superficie estable y sujétate ligeramente.",
      "Mantén el tronco erguido y los pies separados de forma cómoda.",
      "Eleva lentamente una pierna hacia un lado sin inclinar excesivamente el tronco.",
      "Regresa la pierna de forma controlada.",
      "Cambia de lado y repite según tu capacidad.",
      "Mantén una respiración regular durante todo el movimiento.",
    ],
    benefits: [
      "Favorece la fuerza de la musculatura lateral de la cadera.",
      "Puede contribuir al control funcional durante actividades cotidianas.",
      "Permite trabajar de pie con apoyo para mejorar la estabilidad.",
    ],
    adaptations: [
      "Reducir la amplitud de la elevación.",
      "Realizar menos repeticiones.",
      "Utilizar ambas manos como apoyo cuando sea necesario.",
      "Si permanecer de pie no es seguro, sustituir por una alternativa adaptada.",
    ],
    safety: [
      "Mantén una superficie estable cerca.",
      "Evita movimientos rápidos o balanceos.",
      "No continúes si pierdes estabilidad.",
      "Realiza las transiciones lentamente.",
    ],
    stopIf: [
      "Aparece dolor intenso o repentino.",
      "Se pierde el equilibrio.",
      "Aparecen mareo intenso, desmayo o dificultad respiratoria importante.",
      "Aparece dolor en el pecho, sangrado vaginal o pérdida de líquido.",
    ],
    contraindications: [
      "No realizar sin valoración sanitaria si existe una condición que comprometa significativamente el equilibrio, la movilidad o la capacidad para permanecer de pie.",
    ],
  },

  {
    id: "prenatal-cool-down-breathing",
    title: "Movilidad suave y respiración para la vuelta a la calma",
    audience: "prenatal",
    contentType: "exercise",
    objective:
      "Favorecer una transición gradual hacia el reposo mediante movimientos suaves y respiración cómoda al finalizar la actividad.",
    goals: ["mobility", "gentle-activity"],
    difficulty: "basic",
    materials: ["Silla estable opcional"],
    instructions: [
      "Finaliza la actividad reduciendo progresivamente el ritmo.",
      "Adopta una posición cómoda, sentada o de pie con apoyo.",
      "Realiza movimientos suaves de hombros, tobillos y brazos dentro de un rango confortable.",
      "Respira lentamente sin forzar ni contener la respiración.",
      "Permanece unos minutos hasta recuperar una respiración cómoda.",
      "Hidrátate según tus necesidades y las recomendaciones recibidas.",
    ],
    benefits: [
      "Favorece una transición gradual desde la actividad hacia el reposo.",
      "Permite realizar movilidad suave después del ejercicio.",
      "Ayuda a recuperar progresivamente un patrón respiratorio cómodo.",
    ],
    adaptations: [
      "Realizar toda la propuesta sentada.",
      "Reducir la amplitud de los movimientos.",
      "Omitir cualquier movimiento que produzca dolor o incomodidad.",
      "Prolongar el tiempo de recuperación cuando sea necesario.",
    ],
    safety: [
      "No fuerces la respiración ni realices maniobras de contención voluntaria.",
      "Realiza los movimientos lentamente.",
      "Si aparece mareo, detén la actividad y adopta una posición segura.",
      "Respeta las recomendaciones específicas de tu equipo sanitario.",
    ],
    stopIf: [
      "Aparece dolor en el pecho.",
      "Aparece dificultad respiratoria importante o inesperada.",
      "Se presenta mareo intenso, desmayo o debilidad importante.",
      "Aparecen sangrado vaginal, pérdida de líquido o contracciones dolorosas o regulares.",
    ],
    contraindications: [
      "No utilizar esta propuesta para intentar controlar o aliviar un síntoma obstétrico preocupante; ante señales de alarma, detén la actividad y busca orientación sanitaria.",
    ],
  },
];
