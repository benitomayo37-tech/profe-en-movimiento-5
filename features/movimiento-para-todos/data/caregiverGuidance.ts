import type { MovementManeuver } from "../types";

export const caregiverGuidance: MovementManeuver[] = [
  {
    id: "caregiver-prepare-environment",
    title: "Preparar el entorno antes de ayudar",
    audience: "reduced-mobility",
    contentType: "caregiver",
    objective:
      "Reducir obstáculos y preparar un entorno estable antes de acompañar cualquier movimiento o cambio de posición.",
    preparation: [
      "Explica a la persona qué movimiento se va a realizar y comprueba que comprende y desea participar.",
      "Retira obstáculos, objetos sueltos y elementos que puedan provocar tropiezos.",
      "Comprueba que la superficie de apoyo sea estable y que exista espacio suficiente para moverse.",
      "Coloca los elementos necesarios al alcance antes de comenzar.",
      "Si se utilizará una silla de ruedas, cama u otro dispositivo, comprueba que esté preparado y en condiciones adecuadas.",
    ],
    steps: [
      "Detente y observa el entorno antes de iniciar el movimiento.",
      "Organiza el espacio para evitar desplazamientos innecesarios durante la ayuda.",
      "Comprueba que el cuidador también tenga una posición estable y espacio suficiente.",
      "Realiza el movimiento únicamente cuando la persona y el entorno estén preparados.",
    ],
    personPosition:
      "La persona debe encontrarse en una posición cómoda, estable y compatible con el movimiento previsto.",
    caregiverPosition:
      "El cuidador debe mantener una base estable, evitar torsiones y colocarse de forma que pueda comunicarse claramente con la persona.",
    safety: [
      "No improvises una transferencia en un espacio reducido o inseguro.",
      "No tires de la persona para superar obstáculos.",
      "Evita trabajar en posiciones que obliguen al cuidador a girar o flexionar excesivamente la espalda.",
      "Si el entorno no puede prepararse de forma segura, detén la actividad y busca otra solución.",
    ],
    doNotAttemptIf: [
      "La persona presenta un cambio repentino de estado, confusión importante o pérdida de capacidad que no estaba presente.",
      "No existe espacio suficiente para realizar el movimiento con seguridad.",
      "El cuidador considera que no puede realizar la ayuda de forma segura.",
    ],
  },

  {
    id: "caregiver-communicate-before-moving",
    title: "Explicar y coordinar el movimiento",
    audience: "reduced-mobility",
    contentType: "caregiver",
    objective:
      "Favorecer la participación de la persona mediante comunicación clara, anticipación y coordinación antes y durante el movimiento.",
    preparation: [
      "Explica de forma sencilla qué se pretende hacer.",
      "Pregunta qué puede hacer la persona por sí misma.",
      "Acuerda una señal sencilla para comenzar, detenerse o pedir una pausa.",
      "Si participan varios cuidadores, acuerden quién coordinará las indicaciones.",
    ],
    steps: [
      "Da una instrucción breve y clara.",
      "Permite que la persona participe dentro de sus capacidades.",
      "Realiza una pausa si la persona necesita reorganizarse.",
      "Detén el movimiento inmediatamente si la persona comunica dolor, miedo o inseguridad.",
    ],
    personPosition:
      "La persona debe poder escuchar y comprender las indicaciones y encontrarse en una posición que le permita participar cuando sea posible.",
    caregiverPosition:
      "El cuidador debe situarse de manera que pueda comunicarse visual y verbalmente con la persona.",
    safety: [
      "No sorprendas a la persona iniciando un movimiento sin avisar.",
      "No obligues a realizar una acción que la persona no puede comprender o ejecutar.",
      "Evita dar varias instrucciones complejas al mismo tiempo.",
      "Respeta la comunicación y las preferencias de la persona.",
    ],
    doNotAttemptIf: [
      "La persona no puede colaborar y no existe un plan profesional para realizar la movilización.",
      "El cuidador no comprende cómo debe realizarse la maniobra indicada.",
      "Existe una alteración repentina del estado de conciencia o de la capacidad de respuesta.",
    ],
  },

  {
    id: "caregiver-repositioning",
    title: "Acompañar un cambio de posición",
    audience: "reduced-mobility",
    contentType: "caregiver",
    objective:
      "Orientar la preparación de un cambio de posición sencillo, priorizando la participación de la persona y evitando levantamientos manuales innecesarios.",
    preparation: [
      "Comprueba la posición actual y la capacidad de la persona para colaborar.",
      "Explica el movimiento antes de comenzar.",
      "Prepara almohadas, cojines u otros elementos que formen parte del plan de cuidados.",
      "Asegura que la superficie de apoyo sea estable.",
    ],
    steps: [
      "Permite que la persona realice la parte del movimiento que pueda ejecutar por sí misma.",
      "Coordina el movimiento de forma lenta y progresiva.",
      "Haz pausas para comprobar comodidad y seguridad.",
      "Una vez finalizado el cambio de posición, comprueba que la persona esté cómoda y estable.",
    ],
    personPosition:
      "Debe mantenerse una posición estable y confortable durante todo el proceso.",
    caregiverPosition:
      "El cuidador debe evitar torsiones y esfuerzos bruscos y utilizar, cuando corresponda, los dispositivos indicados por profesionales.",
    safety: [
      "Evita arrastrar directamente a la persona sobre la superficie cuando pueda producir fricción o lesión.",
      "No realices movimientos bruscos.",
      "Protege las zonas sensibles y la piel frágil.",
      "Utiliza ayudas técnicas cuando hayan sido indicadas y exista formación para utilizarlas.",
    ],
    doNotAttemptIf: [
      "Existe una lesión reciente o una restricción específica de movimiento que no conoces.",
      "La persona presenta dolor intenso durante el intento.",
      "La persona no puede colaborar y el cuidador no dispone del equipo o apoyo necesario.",
    ],
  },

  {
    id: "caregiver-transfer-planning",
    title: "Planificar una transferencia segura",
    audience: "reduced-mobility",
    contentType: "caregiver",
    objective:
      "Promover una evaluación básica previa antes de cualquier transferencia entre superficies, evitando improvisaciones y levantamientos manuales.",
    preparation: [
      "Valora la capacidad actual de la persona para mantenerse sentada, ponerse de pie o colaborar.",
      "Comprueba el destino y la superficie de llegada.",
      "Prepara el espacio y elimina obstáculos.",
      "Comprueba que los dispositivos utilizados estén correctamente colocados y en condiciones adecuadas.",
      "Si la persona necesita una ayuda técnica o más de un cuidador, sigue el plan establecido por profesionales.",
    ],
    steps: [
      "Explica la transferencia antes de iniciarla.",
      "Comprueba que todas las personas implicadas conozcan su función.",
      "Permite que la persona participe dentro de sus posibilidades.",
      "Realiza únicamente la transferencia para la que el cuidador esté capacitado y la persona haya sido valorada.",
      "Después comprueba estabilidad, comodidad y cualquier señal de malestar.",
    ],
    personPosition:
      "Debe situarse de acuerdo con el plan de transferencia y con el nivel de movilidad que tenga disponible.",
    caregiverPosition:
      "Debe mantener una posición estable y evitar levantar manualmente el peso corporal de la persona.",
    safety: [
      "Las transferencias deben basarse en las capacidades actuales de la persona y no en suposiciones.",
      "No levantes a una persona manualmente si no puedes hacerlo de forma segura.",
      "Las transferencias complejas pueden requerir dos o más cuidadores o equipos específicos.",
      "La selección y utilización de dispositivos debe realizarse con la formación correspondiente.",
    ],
    doNotAttemptIf: [
      "No conoces la capacidad de carga o colaboración de la persona.",
      "La persona no puede participar y no existe el equipo o apoyo adecuado.",
      "Existe riesgo elevado de caída.",
      "El cuidador no ha recibido formación para la transferencia requerida.",
    ],
  },

  {
    id: "caregiver-after-fall",
    title: "Qué hacer ante una caída",
    audience: "reduced-mobility",
    contentType: "caregiver",
    objective:
      "Promover una respuesta segura ante una caída, evitando levantar inmediatamente a la persona sin valorar primero su situación.",
    preparation: [
      "Mantén la calma y habla con la persona.",
      "Comprueba si responde y si puede comunicarse.",
      "Observa si existe dolor intenso, sangrado, deformidad, golpe importante o dificultad para respirar.",
      "Solicita ayuda cuando la situación lo requiera.",
    ],
    steps: [
      "No intentes levantar inmediatamente a la persona por los brazos.",
      "Si existe sospecha de lesión importante, evita moverla innecesariamente y solicita atención sanitaria.",
      "Si la persona está consciente y estable, sigue las indicaciones del equipo sanitario o del plan de atención previamente establecido.",
      "Después de la caída, informa del incidente a quien corresponda y revisa las posibles causas para prevenir nuevas caídas.",
    ],
    personPosition:
      "Debe permanecer en la posición en la que se encuentre hasta determinar que es seguro moverla.",
    caregiverPosition:
      "El cuidador debe priorizar la seguridad, mantener la calma y solicitar ayuda cuando no pueda resolver la situación por sí mismo.",
    safety: [
      "Una caída puede producir lesiones aunque inicialmente parezcan leves.",
      "No levantes a una persona que presenta dolor intenso, deformidad, pérdida de conciencia o un cambio importante de estado.",
      "No utilices una maniobra improvisada para levantar a una persona desde el suelo.",
    ],
    doNotAttemptIf: [
      "Existe pérdida de conciencia o alteración importante del estado de alerta.",
      "Existe dolor intenso, deformidad, sangrado importante o sospecha de lesión grave.",
      "La persona no puede colaborar y no se dispone de ayuda o equipo apropiado.",
      "El cuidador no sabe cómo realizar el levantamiento de forma segura.",
    ],
  },

  {
    id: "caregiver-assistive-devices",
    title: "Uso responsable de ayudas técnicas",
    audience: "reduced-mobility",
    contentType: "caregiver",
    objective:
      "Promover el uso seguro y responsable de ayudas técnicas, evitando improvisaciones y seleccionando los dispositivos según las necesidades individuales.",
    preparation: [
      "Utiliza únicamente dispositivos adecuados para la persona y para la tarea.",
      "Comprueba que el dispositivo esté en buen estado antes de utilizarlo.",
      "Verifica que la persona sepa cómo participar en el movimiento.",
      "Si el dispositivo requiere formación, sigue las indicaciones del profesional o fabricante.",
    ],
    steps: [
      "Coloca el dispositivo según las instrucciones correspondientes.",
      "Comprueba su estabilidad antes de iniciar el movimiento.",
      "Permite que la persona participe dentro de sus capacidades.",
      "Después del uso, guarda el dispositivo de forma segura y accesible.",
    ],
    personPosition:
      "Debe utilizar el dispositivo de acuerdo con su capacidad funcional y con las instrucciones recibidas.",
    caregiverPosition:
      "Debe conocer las limitaciones del dispositivo y evitar utilizarlo como sustituto de una valoración profesional.",
    assistiveDevices: [
      "Silla de ruedas",
      "Andador",
      "Bastón",
      "Barras de apoyo",
      "Dispositivos de transferencia indicados por profesionales",
    ],
    safety: [
      "No improvises modificaciones en dispositivos de movilidad.",
      "Comprueba ruedas, frenos, apoyos y elementos de seguridad antes del uso cuando corresponda.",
      "Respeta la capacidad máxima y las indicaciones del fabricante.",
      "Los dispositivos de transferencia requieren formación específica para su utilización segura.",
    ],
    doNotAttemptIf: [
      "El dispositivo está deteriorado o presenta una falla.",
      "No conoces su funcionamiento.",
      "La persona necesita un nivel de asistencia superior al que el dispositivo puede proporcionar.",
    ],
  },
];