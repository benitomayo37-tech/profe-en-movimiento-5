import type { AIToolId } from "@/features/ai/types/ai";

const TOOL_PROMPT_INSTRUCTIONS: Record<AIToolId, string> = {
  "lesson-plan": `
INSTRUCCIONES ESPECÍFICAS PARA CREAR PLANIFICACIÓN

Crea una planificación de Educación Física segura, aplicable y coherente con el nivel, duración, cantidad de estudiantes y materiales proporcionados.

REGLAS GENERALES

- Conserva literalmente el nivel educativo y el código curricular.
- No inventes códigos curriculares.
- Utiliza exclusivamente los materiales indicados.
- El campo "rubric" debe ser null.
- Escribe completamente en español.
- Evita repeticiones y utiliza párrafos breves.
- No escribas términos como checklist, coaching, feedback, observations, tablero, ficha, pizarra o teléfono.
- No reproduzcas instrucciones internas, propiedades técnicas ni valores JSON.

SECCIONES OBLIGATORIAS Y ORDEN

Genera exactamente estas secciones y conserva este orden:

1. Datos y propósito de la sesión.
2. Objetivo de aprendizaje.
3. Organización del grupo, espacio y materiales.
Metodología aplicada.
4. Inicio.
5. Desarrollo.
6. Cierre y vuelta a la calma.
7. Evaluación del aprendizaje.
8. Medidas de seguridad.
9. Estrategias DUA integradas, únicamente si DUA está activado.
10. Apoyos para adaptación NEE, únicamente si NEE está activado.

La sección debe titularse exactamente "Metodología aplicada", sin número,
y debe aparecer inmediatamente después de "Organización del grupo, espacio
y materiales" y antes de "Inicio".

No combines estas secciones, no cambies su orden y no repitas su contenido
en otras partes.

TIEMPO

- Inicio, Desarrollo, Cierre y Evaluación deben sumar exactamente la duración solicitada.
- Indica el tiempo de cada acción interna.
- Las acciones internas deben sumar exactamente el tiempo del momento correspondiente.
- Las explicaciones, demostraciones, transiciones, recuperación, reflexión y evaluación deben estar contabilizadas.
- Las actividades simultáneas se contabilizan una sola vez.
- No agregues acciones después de completar el tiempo total.
- Las medidas de seguridad se aplican durante la sesión y no añaden minutos.

ORGANIZACIÓN Y PARTICIPACIÓN

- Distribuye exactamente la cantidad de estudiantes solicitada.
- Explica la cantidad de grupos, sus integrantes y las zonas de trabajo.
- Todos los estudiantes deben tener una acción activa simultánea.
- No utilices filas, eliminación, espera pasiva ni observadores inmóviles.
- Nunca escribas "esperan su turno", "espera su turno" ni "aguardan su turno". Al describir una rotación, indica la tarea motriz activa que realiza cada pareja o grupo mientras intercambia funciones.
- No asignes a ningún estudiante el rol de "observador" ni "observador-coevaluador". La coevaluación debe realizarla un pasador, receptor o participante en desplazamiento mientras conserva una función motriz activa.
- La coevaluación debe ser verbal, breve, rotativa y combinarse con una acción motriz segura.
- Las respuestas o reflexiones grupales deben realizarse simultáneamente cuando no exista tiempo para escucharlas una por una.

DISTRIBUCIÓN DE MATERIALES

- Todos los grupos deben practicar realmente cada habilidad que requiera balón u otro material.
- La simulación sin material puede preparar o reforzar la técnica, pero no puede sustituir toda la práctica real.
- Cuando existan menos balones que grupos, forma zonas compartidas y realiza intercambios dentro de cada bloque de aprendizaje.
- No mantengas a un grupo durante un bloque completo sin el material necesario.
- Cada grupo debe utilizar el material en todos los contenidos técnicos principales.

CASO DE 4 BALONES Y 8 GRUPOS

- Organiza exactamente 4 zonas principales.
- En cada zona trabajan 2 grupos de 5 estudiantes y comparten 1 balón.
- En cada bloque técnico, ambos grupos alternan el uso del balón mediante intervalos breves.
- Los intercambios se realizan dentro del mismo bloque, no solamente al terminarlo.
- Mientras un grupo utiliza el balón, el otro realiza una tarea motriz complementaria.
- Después intercambian funciones.
- Los 8 grupos deben practicar con balón cada técnica escrita expresamente por el docente. No agregues pase de pecho, pase de pique, pase sobre la cabeza ni ninguna otra técnica que no aparezca en el tema o en las instrucciones adicionales.
- Antes de responder, compara el objetivo, el desarrollo y la evaluación con el tema. Si una técnica no fue escrita por el docente, elimínala completamente de las tres secciones.
- Dentro de cada zona con 10 estudiantes y 1 balón, organiza 5 parejas y microturnos de 30 segundos: una pareja utiliza el balón y las otras cuatro realizan desplazamientos, desmarques, postura de recepción y retroalimentación verbal en movimiento. Después rota la pareja que utiliza el balón.

DUA

- Si DUA está activado, escribe sus estrategias solamente en la sección "Estrategias DUA integradas".
- No escribas DUA dentro de Inicio, Desarrollo, Cierre, Evaluación o Seguridad.
- Incluye exactamente tres elementos independientes:
  1. REPRESENTACIÓN.
  2. ACCIÓN Y EXPRESIÓN.
  3. COMPROMISO / MOTIVACIÓN.
- Cada principio debe comenzar en un elemento independiente del arreglo content para que reciba su color correcto.
- Relaciona cada estrategia con actividades concretas de la planificación.
- No repitas los principios ni escribas un segundo resumen DUA.

ADAPTACIÓN NEE

- Si NEE está activado, escribe todos los apoyos únicamente en la sección "Apoyos para adaptación NEE".
- No escribas apoyos NEE dentro de otras secciones.
- No supongas dificultades motrices, visuales, atencionales ni diagnósticos no proporcionados.
- Presenta opciones generales mediante demostración, instrucciones verbales, ajuste de ritmo, distancia o espacio y compañero de apoyo.
- Mantén al estudiante dentro del grupo y conserva el objetivo esencial.
- No propongas contacto físico, guía manual ni manipulación corporal, aunque exista autorización.
- Un rol de menor exigencia debe continuar siendo activo, breve y rotativo.

EVALUACIÓN

- Utiliza únicamente observación docente, autoevaluación verbal y coevaluación oral cuando no existan materiales para escribir.
- Incluye entre 3 y 5 indicadores observables relacionados con el objetivo.
- No menciones listas escritas, fichas, rúbricas ni registros materiales que no hayan sido solicitados.
- La evaluación debe realizarse dentro del tiempo declarado.
- La cantidad de ejecuciones simultáneas con balón nunca puede superar la cantidad de balones disponibles.
- No afirmes que todas las parejas realizan pases o una prueba con balón simultáneamente cuando existen menos balones que parejas.
- Para 40 estudiantes y 4 balones, organiza 4 zonas de evaluación con 5 parejas por zona: una pareja ejecuta con el balón durante cada microturno de 30 segundos y las otras cuatro parejas mantienen tareas motrices activas.
- Cuenta solamente las técnicas que el docente haya escrito expresamente en el tema o en las instrucciones adicionales. No conviertas un tema de una sola técnica en una evaluación de tres técnicas.
- Si el docente solicita expresamente pase de pecho, pase de pique y pase sobre la cabeza, realiza exactamente 3 rondas por zona, una por cada tipo de pase. Cada ronda contiene 5 microturnos de 30 segundos, uno por pareja. En cada microturno la pareja evaluada realiza solamente 5 intentos de un tipo de pase; nunca debe intentar los tres tipos dentro del mismo microturno.
- En ese caso se completan 15 microturnos por zona: 3 rondas x 5 parejas x 30 segundos = 7 minutos 30 segundos. Reserva 1 minuto para explicar y 30 segundos para cerrar la evaluación; el bloque independiente de evaluación debe durar exactamente 9 minutos.
- Para una sesión de 45 minutos en la que el docente haya solicitado expresamente esos tres pases, utiliza esta distribución: Inicio 6 minutos, Desarrollo 26 minutos, Cierre 4 minutos y Evaluación 9 minutos. La suma debe ser 45 minutos.
- Si el docente solicita solamente un tipo de pase, evalúa exclusivamente ese pase mediante 5 microturnos por zona y no apliques la distribución especial de tres rondas.

SEGURIDAD

- Incluye separación entre zonas, control de trayectorias y revisión del espacio.
- Si conos o silbato no aparecen expresamente entre los materiales proporcionados, no los menciones ni siquiera como recursos opcionales. Delimita con líneas o referencias naturales del espacio y dirige los cambios mediante una señal verbal o una palmada.
- Incluye alternativas de menor intensidad y señales observables de esfuerzo.
- No inventes equipamiento, dispositivos o recursos institucionales.
- Expresa la prevención de colisiones con lenguaje pedagógico natural.

EXTENSIÓN

- Redacta cada sección de manera compacta.
- No repitas organización, tiempos, DUA, NEE, evaluación o seguridad.
- Evita explicaciones innecesarias para que la planificación pueda imprimirse en un máximo de tres páginas.
`,

  rubric: `
INSTRUCCIONES ESPECÍFICAS PARA CREAR RÚBRICA

- El campo "rubric" debe contener una rúbrica estructurada completa.
- Genera entre 4 y 6 criterios específicos, observables y directamente relacionados con la habilidad solicitada.
- Evita criterios genéricos cuando sea posible evaluar aspectos técnicos, motrices, cooperativos o de seguridad.
- Cada criterio debe contener exactamente cinco descriptores:
  - excellent: desempeño Excelente (10).
  - good: desempeño Bien (9).
  - regular: desempeño Regular (8).
  - acceptable: desempeño Aceptable (7).
  - improvable: desempeño Mejorable (5).

PROGRESIÓN OBLIGATORIA DE LOS DESCRIPTORES

- Excelente (10): desempeño autónomo, preciso, consistente y seguro.
- Bien (9): desempeño mayormente consistente, con errores menores o correcciones ocasionales.
- Regular (8): desempeño intermitente, con errores identificables y apoyo ocasional.
- Aceptable (7): demuestra parcialmente la habilidad esencial y necesita apoyo frecuente.
- Mejorable (5): todavía no demuestra de forma suficiente la habilidad esencial y necesita enseñanza guiada.

REGLAS DE COHERENCIA

- Redacta todos los descriptores mediante conductas que el docente pueda observar.
- Cada nivel debe representar un desempeño claramente diferente.
- No repitas el mismo descriptor cambiando solamente una palabra.
- Redacta cada descriptor de forma compacta, preferentemente entre 18 y 32 palabras, sin perder la conducta observable ni la diferencia entre niveles.
- No utilices rangos que se superpongan entre dos niveles.
- No utilices porcentajes, proporciones ni cantidades como «8 de 10 intentos», salvo que el docente los solicite expresamente.
- Si se solicitan cantidades o porcentajes, utiliza la misma cantidad de intentos en las instrucciones y en todos los descriptores.
- No presentes el nivel Mejorable como una repetición ambigua del nivel Aceptable.
- Evita expresiones punitivas, descalificadoras o que etiqueten al estudiante.
- Conserva literalmente el nivel educativo, el grado o curso y la destreza con criterio de desempeño proporcionados.

APLICACIÓN DE LA RÚBRICA

- Las instrucciones deben ser realistas para la cantidad de estudiantes, el tiempo y los materiales disponibles.
- Propón observaciones representativas durante la ejecución de las actividades.
- Utiliza la propia tabla de la rúbrica como instrumento de registro. No la denomines lista de cotejo, hoja de cotejo, lista de control, hoja de control, ficha de control ni propongas otro instrumento diferente.
- Una misma ejecución observada puede aportar evidencia para varios criterios relacionados; no exijas una ejecución separada por cada criterio.
- No exijas una cantidad de intentos individual imposible de observar dentro de la duración solicitada.
- La cantidad de observaciones debe ser suficiente para valorar todos los criterios y habilidades declarados.
- Si se evalúan varios tipos de ejecución, distribuye observaciones breves y representativas durante las estaciones, sin exigir una cantidad imposible para el grupo.
- No limites la evaluación a dos intentos cuando la rúbrica incluya más de dos habilidades o criterios diferentes.
- Integra toda la observación durante la práctica activa. No agregues una demostración o ejecución final individual que produzca filas, turnos de espera o estudiantes inactivos.
- No organices filas, colas ni turnos en los que solamente una pareja o un estudiante permanezca activo. La aplicación de la rúbrica debe observar el desempeño dentro de una práctica en la que todo el grupo mantenga una función activa.
- Si el docente no solicitó expresamente una organización nueva, no inventes estaciones, sectores ni rotaciones: explica cómo aplicar la rúbrica durante la actividad práctica ya planificada.
- No afirmes que todas las parejas realizan pases simultáneos o continuos cuando existen menos balones que parejas. En ese caso, describe una alternancia breve con funciones motrices activas y explica de forma concreta qué hace cada estudiante mientras no utiliza el balón.
- No utilices las expresiones "quienes esperan", "parejas que esperan" ni "estudiantes que esperan". Nombra directamente la función motriz activa que realizan durante la alternancia.
- Utiliza terminología pedagógica en español. Escribe "sincronización", "momento de ejecución" o "elección oportuna" en lugar de "timing".
- Escribe "acompañamiento final de manos y muñecas" y no utilices el anglicismo "follow-through".
- Calcula obligatoriamente la calificación final mediante una regla de tres explícita.
- Indica el puntaje máximo: cantidad de criterios x 10 puntos.
- Explica la fórmula exactamente así: Regla de tres: calificación final = (puntaje obtenido x 10) ÷ puntaje máximo.
- Incluye un ejemplo numérico resuelto y expresa el resultado final sobre 10.
- No presentes el puntaje acumulado como calificación final; el total solamente se utiliza como base de la conversión mediante regla de tres.
- No inventes códigos curriculares ni modifiques la destreza proporcionada.

ESTRUCTURA VISIBLE

- El título de la rúbrica debe mencionar claramente el contenido o habilidad evaluada.
- Menciona el contenido una sola vez en el título; no repitas el mismo tema antes y después de dos puntos, guiones o rayas.
- En "sections" incluye exactamente estas tres secciones, con estos títulos y en este orden:
  1. Propósito de la rúbrica
  2. Instrucciones de aplicación
  3. Forma de calcular o interpretar el resultado
- La tercera sección debe mostrar el puntaje máximo, la regla de tres, la fórmula completa y un ejemplo numérico resuelto con calificación final sobre 10.
- No dupliques en "sections" los descriptores completos de la rúbrica.
- Si no se solicitaron DUA o NEE, no agregues secciones ni estrategias correspondientes.
- Para esta herramienta, "durationPlan" y "logisticsPlan" deben ser null.
`,

  checklist: `
INSTRUCCIONES ESPECÍFICAS PARA CREAR LISTA DE COTEJO

- Crea una lista de cotejo lista para observar una actividad práctica.
- Incluye exactamente estas cuatro secciones y no agregues otras:
  1. Propósito e instrucciones de aplicación.
  2. Indicadores observables.
  3. Escala o forma de registro.
  4. Interpretación y retroalimentación.
- Integra la organización, los materiales, las rotaciones y las medidas de seguridad dentro de "Propósito e instrucciones de aplicación".
- No crees una sección adicional de organización, resumen operativo, seguridad o materiales.
- Evita repetir en la última sección información organizativa ya explicada en las instrucciones.
- Mantén el contenido suficientemente compacto para que la lista completa pueda imprimirse preferentemente en dos páginas.
- Genera entre 6 y 12 indicadores.
- Redacta cada indicador con una sola conducta observable, concreta y verificable.
- Evita expresiones ambiguas como "lo hace bien", "comprende" o "participa adecuadamente" sin indicar qué se observará.
- Combina, cuando corresponda, aspectos técnicos, cognitivos, actitudinales, de cooperación y seguridad.
- En el pase de pecho, describe la técnica como balón frente al pecho, codos inicialmente flexionados, extensión de brazos y finalización de muñecas; no indiques que el balón se impulsa con los codos.
- En el pase de pique, exige un solo bote controlado antes de llegar al receptor.
- En el pase sobre la cabeza, exige trayectoria controlada y evita lanzamientos dirigidos al rostro.
- Indica una escala sencilla, por ejemplo: Sí / En proceso / No, sin convertirla en una rúbrica por niveles.
- El campo "rubric" debe ser null.
- Presenta cada indicador en formato directamente utilizable:
  Indicador — [ ] Sí | [ ] En proceso | [ ] No.
  - La lista debe permitir registrar el desempeño individual de cada estudiante.
- Incluye espacios de identificación para nombre del estudiante, curso y fecha.
- Utiliza una marca por indicador y por estudiante, salvo que el docente solicite expresamente una evaluación grupal.
- No utilices a un representante para asignar una valoración general a todo el grupo.
- La observación debe integrarse durante la práctica y las rotaciones, sin concentrar todos los indicadores en una demostración final de pocos segundos.
- Si se utiliza coevaluación, cada estudiante debe ser observado individualmente por un compañero y el docente debe verificar muestras durante toda la práctica.
- Todos los estudiantes deben mantener una tarea activa: ejecutante, receptor, observador con lista o responsable de seguridad y espacio.
- No crees más zonas simultáneas de práctica con balón que balones disponibles.
- Si existen más grupos que balones, organiza turnos activos dentro de cada zona o parejas de grupos, sin dejar estudiantes esperando.
- Describe las alternancias con lenguaje positivo. No escribas "durante su turno", "durante la mayoría del turno", "sin permanecer inactivo", "quienes esperan" ni expresiones equivalentes.
- Cuando una zona tenga 10 estudiantes y 1 balón, utiliza microturnos de 30 segundos y declara exactamente: 1 pasador, 1 receptor y 8 participantes sin balón con funciones motrices concretas.
- Distribuye las funciones de los 8 participantes sin balón entre observación técnica móvil, postura de recepción, desplazamientos de apoyo y simulación del gesto. Todos deben rotar por las funciones de pasador, receptor y observación.
- Redacta esa distribución con concordancia gramatical completa: "2 participantes en observación técnica móvil, 2 en postura de recepción, 2 en desplazamientos de apoyo y 2 en simulación del gesto".
- Si se utiliza coevaluación, escribe "cada estudiante es observado individualmente por un compañero asignado". No utilices la expresión "uno a uno".
- Presenta los bloques temporales con el encabezado exacto "Distribución del tiempo:". No escribas "Tiempos (coherentes con el)" ni comentarios internos equivalentes.
- La suma de pasadores, receptores, observadores y demás funciones debe coincidir exactamente con la cantidad de estudiantes de la zona.
- No declares ciclos de 4 minutos de práctica por pareja cuando cinco parejas comparten un solo balón. Indica la duración de cada microturno y la rotación continua de funciones.
- La cantidad de estudiantes, demostraciones e indicadores debe ser viable dentro del tiempo asignado.
- No declares que la evaluación completa de 40 estudiantes y todos los indicadores se realizará únicamente en un cierre de 3 minutos.
- Cuando se solicite DUA, incluye un único bloque con exactamente tres estrategias:
  REPRESENTACIÓN, ACCIÓN Y EXPRESIÓN y COMPROMISO / MOTIVACIÓN.
- Las estrategias DUA deben relacionarse directamente con la aplicación de la lista de cotejo.
- No repitas el nombre del principio dentro de una misma estrategia DUA.
- Si no se solicitó DUA, no incluyas estrategias, principios ni secciones DUA.
- Utiliza exclusivamente los materiales indicados por el docente.
- Comprueba que zonas, estaciones, parejas, turnos y rotaciones sean coherentes entre sí.
- El número de zonas con balón debe ser menor o igual al número de balones disponibles.
- Las instrucciones de aplicación y la escala de registro deben coincidir en si la evaluación es individual o grupal.
- En los apoyos NEE no propongas guía manual, contacto físico,
  manipulación corporal ni asistencia sobre brazos o piernas.
  Utiliza demostraciones, indicaciones verbales, señales,
  ajustes de distancia y apoyo entre compañeros.
- El silbato será utilizado exclusivamente por el docente para controlar la actividad y las rotaciones.
- Utiliza exclusivamente español en todo el contenido. Escribe "retroalimentación positiva" y nunca "feedback positivo".
- En "Escala o forma de registro", explica únicamente el significado de Sí, En proceso y No, junto con el procedimiento para marcar la respuesta.
- No repitas, copies, enumeres ni reformules los indicadores observables dentro de "Escala o forma de registro".
- Cada indicador debe aparecer una sola vez y exclusivamente en la sección "Indicadores observables".
- La sección "Escala o forma de registro" debe contener como máximo 3 elementos breves.
- En "Interpretación y retroalimentación", asigna obligatoriamente: Sí = 1 punto, En proceso = 0,5 puntos y No = 0 puntos.
- Indica el puntaje máximo, igual a la cantidad total de indicadores.
- Calcula la calificación mediante esta regla de tres: calificación final = (puntaje obtenido x 10) ÷ puntaje máximo.
- Incluye un ejemplo resuelto que muestre cantidades de Sí, En proceso y No, el puntaje obtenido y la calificación final sobre 10.
`,

  game: `
INSTRUCCIONES ESPECÍFICAS PARA INVENTAR UN JUEGO

- Crea un juego motor original, comprensible, inclusivo y viable con los materiales disponibles.
- Incluye obligatoriamente secciones diferenciadas para:
  1. Nombre y propósito del juego.
  2. Organización del espacio, grupos y materiales.
  3. Desarrollo paso a paso.
  4. Reglas.
  5. Variantes y progresiones.
  6. Evaluación o evidencias de aprendizaje.
  7. Medidas de seguridad.
- Explica claramente cómo comienza, cómo continúa y cómo termina el juego.
- Evita tiempos de espera prolongados y situaciones de eliminación permanente.
- Adapta el número de equipos, estaciones o turnos a la cantidad de estudiantes.
- Define claramente si la propuesta es un juego continuo o un circuito
  por estaciones.
- Si es un juego continuo, utiliza una única zona general, establece
  logisticsPlan.stations en 1 y no escribas elementos titulados
  "Estación 1", "Estación 2", etc. Todos los grupos deben participar
  simultáneamente dentro de esa organización.
- Si es un circuito, utiliza logisticsPlan.stations con la cantidad real
  de estaciones e incluye una única sección titulada
  "Estaciones: tareas y organización". No crees subsecciones numeradas
  como 5.1, continuaciones artificiales ni secciones para completar
  información anterior.
- Dentro de esa única sección, describe cada estación exactamente una vez
  y en un elemento independiente del arreglo "content". Cada elemento debe
  comenzar con "Estación N —" e incluir de forma compacta la tarea, los
  grupos participantes, la cantidad de estudiantes, los materiales
  asignados y el objetivo fijo utilizado, si corresponde.
- Si una estación reúne más estudiantes que balones disponibles, la propia
  descripción de esa estación debe incluir obligatoriamente estas dos partes:
  "Microturnos: cambio cada 30 segundos" y
  "Funciones sin balón: [acciones motrices concretas]".
- Los microturnos deben indicar una duración concreta en segundos, por ejemplo:
  "Microturnos: cada 30 segundos, dos estudiantes utilizan el balón y luego
  intercambian funciones con otros dos".
- No escribas solamente "rotan", "alternan" o "cambian roles". Debes indicar
  cada cuántos segundos ocurre el cambio.
- Quienes estén momentáneamente sin balón deben realizar funciones motrices
  activas y relacionadas con el propósito: desplazamientos defensivos,
  desmarques, cambios de dirección, postura de recepción, coordinación de
  pies, seguimiento de trayectorias o retroalimentación breve acompañada
  de movimiento.
- No consideres función activa permanecer en fila, esperar turno, observar
  inmóvil, descansar o sostener materiales.
- Estas indicaciones deben aparecer dentro de cada elemento "Estación N —".
  No basta con explicarlas de manera general en otra sección.
- En baloncesto, expresa siempre la dirección del pase de forma positiva:
  hacia las manos, hacia el pecho o hacia el espacio de recepción adecuado.
- No escribas en el contenido final ejemplos de direcciones incorrectas,
  ni siquiera para presentarlas como prohibiciones.
- Cuando una estación tenga 10 estudiantes y 1 balón, solamente 1 estudiante
  será pasador y 1 será receptor durante cada microturno. Los otros 8 deben
  realizar funciones motrices activas sin balón.
- No declares 2 pasadores y 2 receptores simultáneos cuando solamente existe
  1 balón. La suma de funciones debe coincidir exactamente con la cantidad
  de estudiantes y con los materiales disponibles.
- Presenta la distribución mediante este formato compacto:
  "Roles: 1 pasador, 1 receptor y 8 participantes sin balón que realizan
  desmarques, postura de recepción, desplazamientos de apoyo y observación
  técnica móvil".
- Cada estación debe describirse de manera compacta, sin repetir varias veces
  los mismos datos. Incluye tarea, participantes, materiales, microturnos y
  funciones activas en un máximo de 550 caracteres.
- En "Desarrollo paso a paso" no conviertas los minutos a segundos ni calcules
  la cantidad total de microturnos. Indica solamente la duración de cada
  momento, los ciclos y la forma de rotación.
- Evita repetir en "Reglas" y "Desarrollo paso a paso" toda la información que
  ya aparece dentro de las estaciones.
- Mantén el documento completo suficientemente compacto para que pueda
  imprimirse en dos páginas A4 sin reducir la legibilidad.
- No repitas una estación en otra sección. No escribas expresiones internas
  como "restricción de campos", "detalles faltantes", "fixed target",
  "logisticsPlan", "durationPlan" o nombres de propiedades del esquema.
- Diferencia claramente dos tipos de rotación:
  1. Rotación de estaciones: al finalizar cada ciclo, todos los grupos
     pasan simultáneamente a la estación siguiente siguiendo una ruta
     explícita, por ejemplo E1 → E2 → E3 → E4 → E1.
  2. Rotación de roles: ocurre dentro de cada grupo y no sustituye el cambio
     de estación.
- Si existen cuatro estaciones, organiza cuatro ciclos iguales para que
  todos los grupos visiten las cuatro estaciones. Indica expresamente qué
  grupos comienzan en cada estación y confirma que todos recorren el mismo
  circuito durante el mismo tiempo.
- No afirmes que todos los grupos visitan una estación si el procedimiento
  descrito solamente cambia roles dentro de la misma estación.
- Incluye al menos una variante más sencilla y una variante de mayor desafío.
- Si DUA o NEE están activados, integra opciones de participación sin alterar el propósito del juego.
- El campo "rubric" debe ser null.
- La distribución completa debe sumar exactamente la duración solicitada,
  incluyendo calentamiento, explicaciones, rondas, transiciones y cierre.
- Las dimensiones propuestas deben caber realmente en una cancha escolar,
  incluyendo separación de seguridad entre zonas.
- Utiliza exclusivamente los materiales indicados. No agregues chalecos,
  carteles, fichas, teléfonos, grabaciones ni otros balones.
- Si no existen materiales para registrar resultados, utiliza observación docente y retroalimentación oral entre pares.
- Incluye un único bloque DUA con exactamente una estrategia de
  REPRESENTACIÓN, una de ACCIÓN Y EXPRESIÓN y una de
  COMPROMISO / MOTIVACIÓN. No agregues otro resumen DUA.
- Las acciones internas de cada momento deben sumar exactamente
  el tiempo asignado a ese momento.
- Todas las variantes deben mantener activos a todos los estudiantes.
  Si se propone 4 contra 4 en equipos de 5, el quinto participante
  debe tener un rol activo y rotativo dentro del juego.
- Cada descripción de estación debe incluir literalmente una organización de microturnos cronometrados, por ejemplo: "Microturnos de 45 segundos".
- En cada estación escribe también: "Mientras no utiliza el balón..." y completa la frase con desplazamientos, recepción, apoyo, marcaje, comunicación, observación técnica activa o seguridad del espacio.
- La suma de pasadores, receptores y funciones sin balón debe coincidir con la cantidad total de participantes de la estación.
- Aplica la misma alternancia activa durante el calentamiento si existen menos balones que parejas o tríos.
- Utiliza "observador técnico" u "orientador"; no utilices las palabras "coach" ni "coaches".
- En baloncesto dirige los pases a las manos, al pecho o al espacio de recepción adecuado. Nunca propongas pases al pie.
- No confundas "pase y corte" con "pase y cortina". Incluye una cortina o bloqueo solamente cuando haya sido solicitado expresamente.
- Antes de proponer dimensiones, suma el tamaño de todas las zonas,
  pasillos y márgenes. El resultado no puede superar las dimensiones
  totales del espacio disponible.

  COMPROBACIÓN OBLIGATORIA ANTES DE ENTREGAR

- El arreglo "sections" debe contener las siguientes secciones en este orden
  exacto y con estos títulos literales:
  1. "Nombre y propósito del juego"
  2. "Organización del espacio, grupos y materiales"
  3. "Estaciones: tareas y organización"
  4. "Desarrollo paso a paso"
  5. "Reglas"
  6. "Variantes y progresiones"
  7. "Evaluación o evidencias de aprendizaje"
  8. "Medidas de seguridad"
- No agregues números, explicaciones, paréntesis ni subtítulos dentro del campo
  "title". Escribe únicamente el título literal correspondiente.
- Dentro de "Variantes y progresiones" deben aparecer obligatoriamente dos
  elementos independientes que comiencen exactamente así:
  "Variante más sencilla:"
  "Variante de mayor desafío:"
- No sustituyas "Variante de mayor desafío" por expresiones como variante
  avanzada, nivel difícil, progresión compleja, reto adicional o desafío.
- Antes de responder, confirma internamente que los ocho títulos están
  presentes, que mantienen el orden indicado y que las dos variantes utilizan
  exactamente las etiquetas obligatorias.

  FORMATO LITERAL DEL DESARROLLO Y LAS VARIANTES

- Dentro de "Desarrollo paso a paso", presenta tres elementos claramente
  identificados y comenzando exactamente con estas expresiones:
  "Cómo comienza:"
  "Cómo continúa:"
  "Cómo termina:"
- "Cómo comienza:" debe contener el calentamiento y la explicación inicial.
- "Cómo continúa:" debe contener los ciclos, microturnos y rotaciones.
- "Cómo termina:" debe contener el cierre, la evaluación y la recogida.
- Dentro de "Variantes y progresiones", genera exactamente dos elementos:
  uno que comience con "Variante más sencilla:" y otro que comience con
  "Variante de mayor desafío:".
- No incluyas una tercera variante denominada variante base, estándar,
  intermedia o equivalente.
- Para describir la dirección del pase, escribe únicamente formulaciones
  positivas: "hacia las manos", "hacia el pecho" o "hacia el espacio de
  recepción adecuado".
- No escribas ejemplos de direcciones incorrectas ni siquiera dentro de
  prohibiciones, advertencias o reglas de seguridad.
- Genera exactamente las ocho secciones obligatorias del juego. No agregues
  "Metodología aplicada", conclusiones, recomendaciones ni otras secciones.
  COHERENCIA FINAL DE ACTIVIDADES Y EVALUACIÓN

- No escribas "pases sin balón". Cuando no se utilice balón, describe la
  actividad como simulación gestual de pase, postura de recepción,
  desplazamiento, desmarque o coordinación de pies.
- Si una estación declara 1 pasador y 1 receptor, solamente esos dos
  estudiantes intervienen con el balón durante el microturno. No agregues
  un tercer jugador a la secuencia.
- Con 1 balón por estación, las secuencias de microturno deben consistir en
  pase, recepción y devolución entre el pasador y el receptor.
- No propongas listas, fichas, hojas, tarjetas, pizarras ni registros escritos
  cuando esos materiales no hayan sido proporcionados.
- Si no existen materiales de registro, utiliza exclusivamente observación
  directa del docente, retroalimentación oral entre pares y autoevaluación
  oral breve.
`,


  assessment: `
INSTRUCCIONES ESPECÍFICAS PARA CREAR EVALUACIÓN

PROPÓSITO

- Crea una evaluación alineada exclusivamente con el tema, nivel educativo, grado o curso y código curricular proporcionados.
- No añadas técnicas, contenidos, deportes ni habilidades que no hayan sido solicitados.
- Combina conocimiento, aplicación, toma de decisiones y ejecución observable.
- Redacta todo el contenido en español y con vocabulario apropiado para la edad.

ESTRUCTURA OBLIGATORIA Y ORDEN

Genera exactamente estas secciones:

1. Objetivo e indicaciones.
2. Preguntas o actividades teóricas.
3. Tareas prácticas o situaciones de aplicación.
4. Criterios de calificación.
5. Respuestas esperadas u orientaciones para el docente.

Si DUA está activado, añade después:
6. Estrategias DUA aplicadas.

Si NEE está activado, añade al final:
7. Apoyos para adaptación NEE.

No combines las cinco secciones principales, no cambies su orden y no coloques
respuestas dentro de las consignas destinadas al estudiante.
- La sección 5 debe conservar siempre el título literal
  "Respuestas esperadas u orientaciones para el docente".
- Si DUA está activado, utiliza "Estrategias DUA aplicadas" únicamente como
  título de la sección 6 y coloca allí las estrategias de compromiso y
  motivación, sin sustituir ni renombrar la sección de respuestas.

OBJETIVO E INDICACIONES

- Formula un objetivo evaluativo observable y directamente relacionado con el tema.
- Explica qué debe realizar el estudiante, los materiales permitidos, el tiempo disponible y las normas de seguridad.
- Separa claramente las instrucciones generales de las preguntas y tareas calificadas.

PREGUNTAS Y TAREAS

- Si el docente solicita una cantidad concreta de preguntas teóricas y tareas prácticas, genera exactamente esas cantidades.
- No agregues ni elimines elementos respecto de las cantidades solicitadas.
- Si el docente no especifica cantidades, incluye al menos dos preguntas teóricas y una tarea práctica.
- Identifica los elementos teóricos exactamente como "Pregunta 1", "Pregunta 2", etc.
- Identifica los elementos prácticos exactamente como "Tarea 3", "Tarea 4", etc.
- Numera todos los elementos calificables de manera consecutiva y sin reiniciar la numeración.
- Después de las preguntas teóricas, continúa la numeración en las tareas prácticas.
- Escribe el puntaje inmediatamente después del identificador mediante uno de estos formatos:
  "Pregunta 1 (2 puntos): ..."
  "Actividad 2 (2 puntos): ..."
  "Tarea 3 (3 puntos): ..."
- No coloques el puntaje solamente al final del párrafo.
- No repitas números de preguntas, actividades o tareas.
- Cada consigna debe evaluar un aprendizaje diferente y directamente relacionado con el tema.
- Evita preguntas ambiguas, dobles negaciones y tareas que dependan de materiales no proporcionados.
- Limita todas las preguntas y tareas estrictamente a la técnica indicada por el docente.
- No compares con otras técnicas, tipos de pase o contenidos que no hayan sido solicitados.
- Toda tarea calificada que evalúe precisión, recepción o control del balón debe realizarse realmente con balón.
- La ejecución en sombra solamente puede utilizarse como preparación breve no calificada; nunca puede sustituir los pases reales evaluados.
- Si existen menos balones que estudiantes o parejas, organiza turnos activos dentro del mismo bloque para garantizar que todos ejecuten con balón.

PUNTUACIÓN OBLIGATORIA

- El primer elemento de contenido de la sección "Objetivo e indicaciones" debe ser exactamente: "Puntaje total: 10 puntos".
- Escribe esa expresión como un elemento independiente, sin agregar otras palabras en la misma línea.
- La expresión "Puntaje total: 10 puntos" es obligatoria y no puede omitirse durante una corrección o reintento.
- La evaluación se califica directamente sobre 10 puntos.
- La suma de todas las preguntas y tareas debe ser exactamente 10 puntos.
- Cuando se soliciten exactamente 3 preguntas teóricas y 2 tareas prácticas, utiliza esta distribución estable: 1 + 1 + 2 + 3 + 3 = 10 puntos.
- No cambies esa distribución durante una corrección o reintento.
- Asigna un valor explícito a cada pregunta y tarea.
- No utilices puntajes aproximados ni ajustes posteriores por redondeo.
- Ningún elemento individual puede valer más de 10 puntos.
- No utilices escalas sobre 20, 30, 50, 100 ni conversiones posteriores.
- No utilices regla de tres para esta herramienta.
- Antes de finalizar, suma nuevamente todos los puntajes y comprueba que el resultado sea exactamente 10.

CRITERIOS DE CALIFICACIÓN

- Relaciona cada criterio con el número de la pregunta, actividad o tarea correspondiente.
- Para tareas prácticas, utiliza conductas observables, condiciones de ejecución seguras y criterios verificables.
- Los componentes internos de una tarea práctica deben sumar exactamente el puntaje asignado a esa tarea.
- En una evaluación individual del pasador, todos los componentes del puntaje deben depender exclusivamente de sus propios pases y de su propia técnica corporal. No otorgues ni retires puntos al pasador por la recepción o el control realizado por otro estudiante.
- Para una tarea de pase de pecho valorada en 3 puntos mediante dos microturnos, utiliza esta distribución: pase 1 recepcionable = 1 punto; pase 2 recepcionable = 1 punto; técnica corporal del pasador observable en al menos uno de los dos pases = 1 punto.
- Cuando el tercer microturno repita uno de los pases, otorga el punto si vuelve a cumplir el criterio técnico observable. No exijas que muestre una mejora respecto al intento anterior.
- En la tarea de pase de pique y pase por encima de la cabeza, el estudiante puede elegir únicamente el orden de los dos primeros microturnos. El tercer microturno siempre será la repetición que indique el docente.
- El pase por encima de la cabeza sale desde encima de la cabeza del pasador y debe llegar a una zona recepcionable del compañero. Nunca indiques que debe pasar por encima de la cabeza del receptor.
- Describe la posición inicial de las manos con verbos correctos como "colocar" o "mantener". No utilices la expresión incorrecta "emerger las manos".
- Evita criterios subjetivos como "lo hace bien" o "participa adecuadamente" sin una evidencia observable.
- La cantidad de intentos, pases o repeticiones debe coincidir exactamente en la consigna, los criterios y las orientaciones docentes.
- No cambies el denominador entre diferentes secciones.

RESPUESTAS Y ORIENTACIONES DOCENTES

- Mantén las respuestas exclusivamente en la sección "Respuestas esperadas u orientaciones para el docente".
- Identifica cada respuesta con el mismo número utilizado en la consigna.
- Si repites el puntaje de una pregunta o tarea, debe coincidir exactamente con el puntaje mostrado al estudiante.
- Incluye respuestas concretas y orientaciones breves para calificar las tareas prácticas.
- No reveles respuestas, pistas ni soluciones en las secciones destinadas al estudiante.

CONTROL FINAL DE REDACCIÓN Y COHERENCIA TÉCNICA

- Cierra todos los paréntesis y revisa la puntuación antes de entregar el contenido.
- Deja un espacio después de cada guion utilizado como viñeta.
- Utiliza la concordancia correcta: escribe "un pase por microturno", nunca "uno pase por microturno".
- Escribe "verbalmente" y no "vocalmente".
- Utiliza "acompañamiento final de manos y muñecas" y no el anglicismo "follow-through".
- Si la tarea está organizada en microturnos, conserva el término "microturnos" en las consignas, las opciones DUA, los criterios y las orientaciones; no los llames intentos.
- En ese contexto, escribe "microturnos anteriores" y "número de microturnos"; no utilices "intentos previos" ni "número de intentos".
- Si una pregunta solicita comparar dos técnicas concretas, la respuesta esperada debe comparar exclusivamente esas dos técnicas y no introducir una tercera como ejemplo.
- Para diferenciar el pase de pecho del pase de pique, contrasta la trayectoria directa del primero con el único bote controlado del segundo. No utilices el pase por encima de la cabeza como diferencia válida entre ambos.
- En el pase de pique, indica un solo bote controlado aproximadamente a dos tercios de la distancia entre el pasador y el receptor, seguido de la llegada del balón a una zona recepcionable.
- Comprueba que cada respuesta esperada conteste exactamente la pregunta asociada y que no amplíe el contenido solicitado.
- Para presentar una escala escribe "se aplicará la siguiente escala de puntuación"; no utilices la expresión imprecisa "por cada elemento correcto se evaluará la escala completa".
- Escribe "retroalimentaciones verbales breves" o "indicaciones verbales breves"; nunca utilices la expresión incoherente "fichas verbales".

DURACIÓN

- El campo "durationPlan" debe distribuir exactamente la duración solicitada.
- "requestedMinutes" y "totalMinutes" deben coincidir exactamente con la duración solicitada.
- La suma matemática de todos los bloques de "durationPlan" debe coincidir exactamente con "totalMinutes".
- Distribuye el tiempo solamente entre lectura de indicaciones, resolución de preguntas teóricas, ejecución de tareas prácticas y revisión o entrega final.
- No crees bloques temporales para los criterios de calificación ni para las respuestas u orientaciones docentes, porque son referencias para el docente y no acciones adicionales del estudiante.
- En la sección "Objetivo e indicaciones", escribe una sola vez la duración total mediante el formato "Duración total: X minutos".
- No es necesario repetir en el contenido visible los minutos de cada bloque interno.
- Cada minuto debe pertenecer exclusivamente a un bloque y no puede contabilizarse dos veces.
- No agregues calentamientos, explicaciones o actividades fuera de la duración solicitada.
- Comprueba la viabilidad de cada tarea práctica antes de responder: tiempo mínimo = estudiantes que deben pasar x microturnos por estudiante x segundos por microturno / pasadores simultáneos / 60.
- Con 10 estudiantes, 1 pasador simultáneo y microturnos de 30 segundos, dos microturnos por estudiante necesitan como mínimo 10 minutos y tres microturnos por estudiante necesitan como mínimo 15 minutos. Nunca declares un tiempo menor.

LOGÍSTICA DE LAS TAREAS PRÁCTICAS

- Organiza exactamente la cantidad de estudiantes solicitada.
- Todos los estudiantes deben mantener una función activa durante el tiempo de evaluación.
- No utilices filas, espera pasiva, estudiantes inactivos ni grupos sin función.
- No escribas la expresión "en espera"; describe directamente la función activa de cada grupo.
- Utiliza exclusivamente los materiales proporcionados por el docente.
- No agregues carteles, láminas, tarjetas, fichas, pizarras, tableros, teléfonos ni recursos visuales físicos si no fueron proporcionados.
- La cantidad requerida de cada recurso no puede superar la cantidad disponible.
- Si existen menos balones que parejas o grupos, organiza alternancia activa dentro del mismo bloque.
- La ejecución en sombra puede ser preparación no calificada, pero todos deben realizar con balón las repeticiones calificadas.
- "simultaneousParticipants" debe incluir a todos los estudiantes y "waitingParticipants" debe ser 0.
- Cuando una zona tenga 10 estudiantes y 1 balón, cada tarea práctica debe comunicar con claridad esta distribución por microturno, aunque puede emplear una redacción equivalente:
  "Roles: 1 pasador, 1 receptor y 8 participantes sin balón: 2 en observación técnica móvil, 2 en postura de recepción, 2 en desplazamientos de apoyo y 2 en simulación del gesto".
- Los 10 estudiantes deben rotar por todas las funciones. Explica el cambio cada 30 segundos dentro de cada tarea práctica.
- Cuando funcionen 4 zonas simultáneas, escalona la ejecución calificada dentro de cada microturno de 30 segundos: zona 1 al segundo 0, zona 2 al segundo 5, zona 3 al segundo 10 y zona 4 al segundo 15. Así el docente puede observar individualmente a los cuatro pasadores sin cambiar la duración ni dejar participantes inactivos.
- No utilices "parejas fijas". Escribe "parejas asignadas con funciones rotativas de pase y recepción".
- No añadas cronómetro, teléfono, ayudante ni asistente si no aparecen entre los materiales o instrucciones proporcionados. Escribe que el docente controla el tiempo y anuncia verbalmente cada cambio.
- No escribas "registre mentalmente". Si no se proporcionaron materiales de escritura, utiliza observación directa del docente y retroalimentación oral breve durante las rotaciones.
- Si no se proporcionaron materiales de escritura, no menciones fichas de evaluación, hojas de cotejo, registros escritos ni anotaciones. La evidencia se obtiene mediante observación directa mientras el alumnado ejecuta la tarea.
- Si no se proporcionaron materiales de escritura, las preguntas teóricas se responden oralmente mediante intervenciones breves integradas en las rotaciones. No escribas "por escrito", "respuesta escrita" ni "entrega final".
- Si la respuesta es oral, utiliza verbos como "menciona", "explica" o "describe oralmente". No utilices "anota", "escribe", "registra" ni expresiones equivalentes.
- No dejes referencias incompletas como "descrito en", "como se indica en" o paréntesis sin una sección concreta.
- Si una pregunta vale 2 puntos y solicita tres elementos, declara obligatoriamente esta escala completa: tres respuestas correctas = 2 puntos; dos respuestas correctas = 1 punto; una o ninguna = 0 puntos. No escribas solamente "0–2 según completitud".
- Cuando una tarea otorgue a cada estudiante dos microturnos como pasador para realizar dos pases calificados, exige exactamente un pase en cada uno de esos dos microturnos.
- Si una tarea sobre pase de pique y pase por encima de la cabeza concede tres microturnos como pasador, distribúyelos así: un microturno para el pase de pique, otro para el pase por encima de la cabeza y el tercero para una segunda observación técnica de uno de los dos pases indicada por el docente. No permitas utilizar libremente las tres oportunidades para completar solo dos ejecuciones.
- En las estrategias DUA, indica que el estudiante puede elegir el orden de los dos primeros microturnos: pase de pique o pase por encima de la cabeza. Aclara que el docente determina cuál de esos pases se repite en el tercer microturno.
- Incluye "toma de decisión" en el objetivo solamente si alguna consigna evaluada pide elegir o justificar el pase apropiado ante una situación concreta de juego. Si todas las tareas son de conocimiento y ejecución aislada, limita el objetivo a conocimiento y ejecución técnica.
- Escribe completamente en español y revisa concordancia gramatical. No utilices términos ingleses como "stability" ni expresiones incorrectas como "retroalimentación activo", "retroalimentación inmediato" o "preguntas puntadas".
- Revisa que todos los paréntesis estén cerrados y que "microturno" concuerde siempre en masculino: "el microturno", "los tres microturnos".

DUA Y NEE

- Si DUA está activado, aplica REPRESENTACIÓN, ACCIÓN Y EXPRESIÓN y COMPROMISO / MOTIVACIÓN directamente a las consignas y formas de respuesta.
- Si NEE está activado, incluye exactamente cuatro apoyos breves y concretos en una única sección.
- Los apoyos deben facilitar acceso y participación sin reducir automáticamente la expectativa de aprendizaje ni modificar la puntuación total.
- En una tarea motriz, DUA puede adaptar distancia, ritmo, apoyo o forma de acceso, pero no sustituir la ejecución por una explicación oral debido a falta de tiempo.
- Conserva la evidencia esencial, los criterios y el puntaje de la tarea práctica.
- DUA puede adaptar la distancia, el ritmo, el apoyo, la cantidad por serie o la forma de presentar la consigna.
- DUA no puede reemplazar el uso real del balón cuando se evalúan precisión, recepción, dirección o control.
- Todos los estudiantes deben completar con balón la cantidad total de pases calificados.
- Las estrategias DUA deben conservar exactamente la organización, cantidad de grupos, integrantes, zonas y rotaciones definidas en las tareas prácticas y en "logisticsPlan".
- Si la tarea práctica distribuye los intentos en dos microturnos, DUA debe conservar esos dos microturnos. No permitas concentrar todos los intentos en uno solo ni escribir alternativas como "6 en 30 segundos".
- No crees nuevos tamaños de grupo ni organizaciones diferentes dentro de la sección DUA.
- No asignes funciones que necesiten materiales no proporcionados.
- Si utilizas observación entre pares, debe ser verbal, breve, activa y rotativa; no debe requerir anotaciones, fichas, papel ni lápiz.
- Todos los roles DUA deben corresponder a la cantidad exacta de integrantes y mantener una función activa.

ESTRUCTURA TÉCNICA

- El campo "rubric" debe ser null.
- El campo "exam" debe ser null.
- El campo "logisticsPlan" debe contener una distribución logística completa y coherente para las tareas prácticas.
- El campo "durationPlan" debe contener la distribución temporal completa.
- No muestres propiedades JSON, nombres internos, valores booleanos ni instrucciones técnicas en el contenido visible.
`,

  exam: `
INSTRUCCIONES ESPECÍFICAS PARA ELABORAR EXAMEN

PROPÓSITO GENERAL

- Crea un examen completo, claro y apropiado para el nivel educativo, grado, tema y código curricular proporcionados.
- Conserva literalmente el nivel educativo, el grado o curso y el código curricular.
- No inventes ni modifiques códigos curriculares.
- Utiliza exactamente la configuración seleccionada por el docente.
- El campo "exam" debe contener la estructura completa del examen.
- Los campos "rubric", "durationPlan" y "logisticsPlan" deben ser null.
- Escribe completamente en español.
- No muestres nombres de propiedades técnicas, identificadores internos ni instrucciones JSON.

CONFIGURACIÓN OBLIGATORIA

- Respeta exactamente el tipo de examen seleccionado: teórico, práctico o mixto.
- Respeta exactamente la dificultad seleccionada: básica, intermedia o avanzada.
- Genera exactamente la cantidad de preguntas solicitada para cada tipo.
- Respeta el puntaje asignado a cada pregunta.
- La suma de los puntajes de todas las preguntas debe coincidir exactamente con el puntaje total del examen.
- No agregues preguntas, ejercicios, puntos adicionales ni actividades opcionales que alteren el puntaje total.
- No cambies un tipo de pregunta por otro.
- Si la configuración contiene solamente la versión A, genera únicamente esa versión.
- Si se solicitan versiones A y B, genera exactamente dos versiones equivalentes.

TIPOS DE PREGUNTAS

- Selección múltiple: presenta una sola respuesta correcta y distractores plausibles, claros y no ambiguos.
- Verdadero o falso: redacta afirmaciones inequívocas, verificables y apropiadas para el contenido solicitado.
- Comprueba pedagógicamente cada afirmación antes de asignar su respuesta.
- No presentes como verdadera una afirmación que dependa del contexto o admita excepciones.
- Evita expresiones que revelen fácilmente la respuesta, como "siempre", "nunca", "todos", "ninguno" o "la mejor opción", salvo que sean indispensables y completamente correctas.
- Distribuye equilibradamente las respuestas verdaderas y falsas; la diferencia entre ambas cantidades no puede ser mayor que uno.
- En "answerKey", escribe exactamente "Verdadero" o "Falso"; no utilices "True", "False", letras ni valores booleanos.
- Evita construir afirmaciones falsas mediante negaciones artificiales o palabras como "necesariamente incorrecto", porque facilitan adivinar la respuesta.
- Cada afirmación debe evaluar directamente un conocimiento técnico concreto y no mezclar dos criterios diferentes.
- Relación de columnas: incluye todos los elementos necesarios y una correspondencia verificable.
- Completar espacios: deja claramente identificado el espacio que debe completar el estudiante.
- Respuesta corta: solicita una respuesta concreta que pueda calificarse con criterios objetivos.
- Caso de aplicación: plantea una situación apropiada para el nivel y relacionada directamente con el tema.
- Tarea práctica: describe una ejecución observable e incluye criterios concretos para asignar el puntaje.

CALIDAD DE LAS PREGUNTAS

- Alinea todas las preguntas con el tema, el nivel y el código curricular proporcionados.
- Combina comprensión, aplicación y toma de decisiones según la dificultad seleccionada.
- Evita preguntas capciosas, información innecesaria y dobles negaciones.
- Evita que una pregunta revele directamente la respuesta de otra.
- No repitas la misma pregunta mediante pequeños cambios de redacción.
- Utiliza vocabulario comprensible para la edad y el nivel educativo.
- En preguntas de selección múltiple, utiliza opciones homogéneas en extensión y estructura.
- Distribuye equilibradamente la posición de las respuestas correctas.
- En tareas prácticas, utiliza conductas observables y condiciones seguras de ejecución.
- El campo prompt debe contener únicamente el enunciado; no incluyas dentro de prompt el número de pregunta ni expresiones como "(2 puntos)", porque la interfaz añade esos datos automáticamente.
- Utiliza evaluationCriteria únicamente para tareas prácticas.
- En preguntas teóricas, evaluationCriteria debe ser null.
- No escribas "respuesta esperada", "respuesta correcta", letras correctas, verdadero o falso resuelto ni pistas del solucionario dentro de prompt, options o evaluationCriteria.
- Todas las respuestas deben aparecer exclusivamente dentro de answerKey cuando el solucionario haya sido solicitado.
- Antes de finalizar, verifica nuevamente la exactitud pedagógica de cada pregunta y de su respuesta.
- En situaciones deportivas, evita afirmar que una técnica es siempre la mejor cuando su conveniencia depende de la distancia, la oposición o la posición de los participantes.
- Utiliza terminología completamente en español cuando exista un equivalente claro.
- Escribe "acompañamiento final de manos y muñecas" en lugar de "follow-through".
- Evita anglicismos innecesarios dentro de las preguntas, opciones y solucionario.

VERSIONES A Y B

- Las versiones A y B deben evaluar los mismos aprendizajes.
- Ambas versiones deben conservar exactamente:
  - la misma cantidad de preguntas;
  - los mismos tipos de preguntas;
  - el mismo nivel de dificultad;
  - el mismo puntaje total;
  - el mismo puntaje por tipo de pregunta.
- Cambia el orden de las preguntas y de las opciones cuando sea pedagógicamente válido.
- Cuando sea necesario, utiliza situaciones equivalentes sin cambiar la habilidad o conocimiento evaluado.
- No conviertas la versión B en un examen más fácil o más difícil.
- Numera las preguntas de cada versión desde 1.

SOLUCIONARIO

- Incluye el solucionario únicamente cuando haya sido solicitado.
- Separa claramente las respuestas de la versión A y de la versión B.
- Indica el número de pregunta y la respuesta correcta.
- Para preguntas de verdadero o falso, la respuesta debe escribirse completamente en español como "Verdadero" o "Falso".
- Revisa que cada respuesta del solucionario coincida realmente con la consigna y no sea solamente plausible.
- En preguntas de respuesta corta, casos o tareas prácticas, incluye una respuesta esperada o criterios concretos de calificación.
- No coloques las respuestas dentro de las consignas destinadas al estudiante.
- No incluyas explicaciones extensas salvo que sean necesarias para orientar la calificación.

TABLA DE CALIFICACIÓN Y REGLA DE TRES

- Incluye la tabla de calificación únicamente cuando haya sido solicitada.
- Relaciona el puntaje obtenido con una calificación final sobre 10.
- Cuando se solicite la regla de tres, utiliza esta fórmula:
  Calificación = (puntaje obtenido × 10) ÷ puntaje total.
- Calcula los valores de manera consistente con el puntaje total seleccionado.
- No otorgues una calificación superior a 10 ni inferior a 0.
- La tabla y la fórmula deben utilizar el mismo puntaje total del examen.
- Si la regla de tres no fue solicitada, no agregues la fórmula por iniciativa propia.

ESTRUCTURA VISIBLE

- Presenta primero los datos generales y las instrucciones para el estudiante.
- Presenta cada versión del examen de forma independiente.
- Separa el material destinado al estudiante del solucionario destinado al docente.
- Mantén visibles el número de cada pregunta y su puntaje.
- Incluye espacios para nombre del estudiante, curso y fecha.
- Utiliza "sections" únicamente para una introducción breve, orientaciones de aplicación y criterios generales.
- No dupliques dentro de "sections" todas las preguntas almacenadas en el campo "exam".
- Mantén el contenido organizado para facilitar su visualización e impresión.
`,

  "dua-adaptation": `
INSTRUCCIONES ESPECÍFICAS PARA CREAR UNA ADAPTACIÓN DUA

PROPÓSITO

- Transforma la actividad indicada por el docente en una propuesta inclusiva,
  concreta y aplicable mediante el Diseño Universal para el Aprendizaje.
- Conserva el propósito, el contenido y la evidencia esencial de aprendizaje.
- Modifica las formas de acceso, participación, apoyo y demostración sin
  convertir la actividad en una propuesta diferente.
- Aplica obligatoriamente los tres principios DUA aunque la opción general
  "Incluir DUA" aparezca desactivada.
- No emitas diagnósticos ni atribuyas condiciones personales al estudiantado.

ESTRUCTURA OBLIGATORIA Y ORDEN

Genera exactamente estas seis secciones y conserva este orden:

1. "Actividad y propósito que se adapta"
2. "Barreras previsibles"
3. "Estrategias de representación"
4. "Estrategias de acción y expresión"
5. "Estrategias de compromiso y motivación"
6. "Aplicación práctica y evaluación inclusiva"

- Utiliza literalmente esos títulos en el campo "title".
- No agregues números, aclaraciones, paréntesis ni subtítulos al título.
- No combines secciones ni agregues conclusiones, metodología, resumen,
  recomendaciones generales u otras secciones.

ACTIVIDAD Y PROPÓSITO QUE SE ADAPTA

- Describe de forma breve la actividad original, el nivel educativo, el curso,
  la cantidad de estudiantes, el espacio y los materiales disponibles.
- Explica claramente qué aprendizaje debe mantenerse sin modificación.
- No agregues técnicas, contenidos, deportes ni objetivos que no hayan sido
  solicitados por el docente.

BARRERAS PREVISIBLES

- Identifica entre tres y cinco barreras vinculadas directamente con la
  actividad solicitada.
- Analiza barreras relacionadas con comprensión de instrucciones, percepción
  de demostraciones, organización del espacio, uso de materiales, ritmo de
  ejecución, interacción, motivación o formas de demostrar el aprendizaje.
- Redacta las barreras como características de la actividad o del entorno,
  no como defectos del estudiante.
- No inventes discapacidades, diagnósticos, enfermedades ni necesidades
  individuales que no hayan sido proporcionadas.
- No presentes como barrera una característica que luego no sea atendida por
  ninguna estrategia.
- Presenta cada barrera como un elemento independiente del arreglo "content".
- No agrupes todas las barreras en un único párrafo.

ESTRATEGIAS DE REPRESENTACIÓN

- Incluye exactamente dos estrategias concretas.
- Cada elemento debe comenzar con "REPRESENTACIÓN —".
- Ofrece diferentes formas de comprender la consigna, la secuencia, las reglas,
  el espacio o el criterio de logro.
- Utiliza demostración docente, modelado entre pares, explicación segmentada,
  palabras clave, orientación espacial o repetición verbal cuando esos apoyos
  no requieran materiales adicionales.
- Cada estrategia debe indicar:
  1. qué barrera atiende;
  2. qué hará el docente;
  3. qué opción tendrá el estudiante;
  4. en qué momento se aplicará;
  5. qué evidencia observable permitirá comprobar su utilidad.

ESTRATEGIAS DE ACCIÓN Y EXPRESIÓN

- Incluye exactamente dos estrategias concretas.
- Cada elemento debe comenzar con "ACCIÓN Y EXPRESIÓN —".
- Ofrece opciones de ritmo, distancia, complejidad, forma de participación,
  apoyo entre compañeros o modo de demostrar el aprendizaje.
- Si el objetivo es motriz, ninguna explicación verbal, dibujo, observación o
  respuesta teórica puede sustituir completamente la ejecución motriz esencial.
- Las opciones deben mantener el mismo propósito y criterios fundamentales.
- Cada estrategia debe indicar:
  1. qué barrera atiende;
  2. qué hará el docente;
  3. qué opción tendrá el estudiante;
  4. en qué momento se aplicará;
  5. qué evidencia observable permitirá comprobar su utilidad.

ESTRATEGIAS DE COMPROMISO Y MOTIVACIÓN

- Incluye exactamente dos estrategias concretas.
- Cada elemento debe comenzar con "COMPROMISO / MOTIVACIÓN —".
- Ofrece elecciones limitadas y viables relacionadas con roles, nivel inicial
  de desafío, compañeros de trabajo, metas inmediatas o retroalimentación.
- Evita premios materiales, castigos, eliminación, exposición pública,
  comparaciones entre estudiantes y competencias excluyentes.
- Cada estrategia debe indicar:
  1. qué barrera atiende;
  2. qué hará el docente;
  3. qué opción tendrá el estudiante;
  4. en qué momento se aplicará;
  5. qué evidencia observable permitirá comprobar su utilidad.

FORMATO COMPACTO DE LAS ESTRATEGIAS

- Cada estrategia debe redactarse en un único párrafo de máximo 700 caracteres.
- Utiliza exactamente este formato, sin numerar sus componentes:
  "[PRINCIPIO] — Barrera: [...]. Docente: [...]. Opción del estudiante: [...].
  Momento: [...]. Evidencia observable: [...]."
- No escribas "1)", "2)", "3)", "4)" ni "5)" dentro de las estrategias.
- Evita repetir explicaciones que ya aparezcan en otra sección.
- Escribe "la retroalimentación" y "retroalimentación inmediata".
- El silbato se utilizará únicamente para iniciar, detener, señalar rotaciones
  o advertir una situación de riesgo. No lo utilices para dividir explicaciones.
- Para aumentar el desafío, modifica distancia, ritmo, desplazamiento o toma
  de decisiones. No solicites simplemente aplicar más fuerza.

  APLICACIÓN PRÁCTICA Y EVALUACIÓN INCLUSIVA

- Explica cómo se integrarán las seis estrategias dentro de la actividad real,
  sin presentarlas como tareas separadas o añadidas al final.
- Organiza a todos los estudiantes con una función activa y evita filas,
  eliminación, espera pasiva o estudiantes sin participación.
- Relaciona cada barrera con al menos una estrategia concreta.
- Define entre tres y cinco evidencias observables, vinculadas con el propósito
  original y aplicables a las diferentes opciones de participación.
- Explica cómo ofrecerá el docente retroalimentación breve, específica y
  respetuosa durante la actividad.
- Mantén criterios equivalentes para todos, permitiendo diferentes medios de
  acceso, ejecución y expresión.
- Incluye medidas de seguridad relacionadas con el espacio, los materiales,
  los desplazamientos y la organización del grupo.
- Presenta exactamente cinco elementos breves que comiencen así:
  1. "Integración:"
  2. "Organización activa:"
  3. "Evidencias observables:"
  4. "Retroalimentación:"
  5. "Seguridad:"
- Cada elemento debe tener como máximo 450 caracteres.
- Diferencia claramente grupos y zonas. No escribas "grupos (zonas)".
- Indica por separado cuántos grupos existen y en cuántas zonas se distribuyen.
- No escribas "ver logística", "según la logística" ni expresiones similares.
  Explica directamente la distribución con lenguaje pedagógico natural.
- Cuando no existan materiales para escribir, utiliza observación directa,
  registro mental y comentarios orales. No propongas notas escritas.  

MATERIALES, ORGANIZACIÓN Y SEGURIDAD

- Utiliza exclusivamente los materiales indicados por el docente.
- No propongas carteles, pictogramas, tarjetas, fichas, hojas, pizarras,
  dispositivos, grabaciones ni materiales auxiliares si no fueron proporcionados.
- Cuando no existan recursos visuales o escritos, utiliza demostraciones,
  ubicación espacial, gestos, modelado, palabras clave y explicaciones verbales.
- La cantidad de grupos, zonas y recursos utilizados debe ser coherente con la
  cantidad de estudiantes y los materiales disponibles.
- Si existen menos implementos que estudiantes, organiza alternancia activa,
  tareas simultáneas o funciones motrices relacionadas sin dejar estudiantes
  esperando.
- No propongas guía manual, manipulación corporal, sujeción de brazos o piernas
  ni contacto físico como apoyo.
- Utiliza demostraciones, señales verbales, ajustes de distancia, ritmo,
  trayectoria, espacio y apoyo verbal entre compañeros.

PRESENTACIÓN VISUAL

- Escribe siempre los nombres completos de los tres principios:
  REPRESENTACIÓN, ACCIÓN Y EXPRESIÓN y COMPROMISO / MOTIVACIÓN.
- No escribas los nombres de colores dentro del título, las estrategias ni
  cualquier otra parte del contenido visible.
- La interfaz será responsable de aplicar la identificación visual de cada
  principio.
- No escribas propiedades del esquema, valores booleanos, instrucciones
  internas ni explicaciones sobre el funcionamiento de Profe IA.
- Redacta la participación mediante formulaciones positivas como:
  "todos mantienen una función activa", "cada estudiante participa" o
  "los roles cambian de manera continua".
- No escribas en el contenido visible las expresiones "espera pasiva",
  "sin filas" o "evitar filas", ni siquiera para negarlas.
- No copies dentro del contenido visible nombres como logisticsPlan,
  durationPlan, waitingParticipants, simultaneousParticipants, null,
  true, false ni otros campos o valores del esquema.
- Traduce siempre la organización estructurada a lenguaje pedagógico natural:
  cantidad de grupos, funciones activas, materiales utilizados y distribución
  del espacio.  

CAMPOS ESTRUCTURADOS

- No utilices marcadores pendientes como "X pases", "N repeticiones",
  "cantidad por definir" ni valores aproximados sin completar.
  Todas las metas deben contener cantidades concretas y realizables.
- Utiliza exclusivamente vocabulario pedagógico en español.
  Escribe "observador orientador" u "observador con retroalimentación";
  no utilices "coach" ni "feedback".
- Cuando el aprendizaje esencial sea motriz, todos los estudiantes deben
  ejecutar realmente la habilidad con el material correspondiente.
- El rol de observador es complementario y rotativo; nunca debe sustituir
  permanentemente la ejecución motriz del estudiante.
- Si se permite elegir un rol, la elección corresponde únicamente al rol
  inicial. Después, todos deben rotar por las diferentes funciones.
- Las opciones DUA pueden modificar la distancia, el ritmo, la cantidad de
  intentos o el nivel de dificultad, pero deben conservar la evidencia
  motriz esencial.
- Formula desafíos con cantidades concretas, por ejemplo 3 o 5 pases
  controlados. No solicites porcentajes si no existen materiales para
  registrar y calcular resultados.
- El campo "rubric" debe ser null.
- El campo "durationPlan" debe ser null.
- El campo "logisticsPlan" debe reflejar de manera coherente la cantidad de
  estudiantes, grupos, zonas, recursos, participación simultánea y control
  del riesgo.
- La información visible debe coincidir con la organización declarada en
  logisticsPlan.
`,

  "nee-adaptation": `
INSTRUCCIONES ESPECÍFICAS PARA CREAR ADAPTACIÓN NEE

PROPÓSITO

- Crea una adaptación pedagógica inclusiva, práctica y aplicable a la actividad solicitada.
- Conserva el tema, nivel educativo, grado o curso, destreza curricular, duración, cantidad de estudiantes y materiales proporcionados.
- No emitas diagnósticos, recomendaciones clínicas ni conclusiones sobre una condición del estudiante.
- Si el docente no indicó una necesidad concreta, decláralo expresamente y formula apoyos flexibles a partir de barreras observables de la actividad o del entorno.
- Si se indicó una necesidad, utiliza solamente la información proporcionada y denomínala "necesidad indicada por el docente".

ESTRUCTURA OBLIGATORIA

Genera exactamente estas seis secciones, con estos títulos y en este orden:

1. Actividad y aprendizaje esencial.
2. Necesidad indicada y barreras observables.
3. Ajustes de acceso, espacio y comunicación.
4. Variantes de ejecución y participación.
5. Apoyos del docente y de los compañeros.
6. Evaluación, seguimiento y seguridad.

No agregues secciones adicionales, resúmenes, anexos ni recomendaciones externas.

ACTIVIDAD Y APRENDIZAJE ESENCIAL

- Describe brevemente la actividad original, el grupo, el espacio y los materiales disponibles.
- Identifica claramente el aprendizaje esencial que debe conservarse.
- Si el aprendizaje es motriz, todos los estudiantes deben realizar la ejecución motriz real.
- No sustituyas completamente una ejecución práctica por explicación oral, dibujo, observación, arbitraje o registro.

NECESIDAD Y BARRERAS

- Indica si existe o no una necesidad específica proporcionada por el docente.
- Incluye entre 3 y 5 barreras independientes, concretas y observables.
- Describe las barreras desde la consigna, el espacio, los materiales, la comunicación, el ritmo, la organización o la participación.
- No atribuyas diagnósticos, enfermedades, trastornos o discapacidades que no hayan sido expresamente indicados.
- No utilices expresiones estigmatizantes como "estudiante normal", "incapaz", "deficiente", "problemático" o "no puede aprender".

AJUSTES DE ACCESO, ESPACIO Y COMUNICACIÓN

- Incluye exactamente 4 ajustes breves.
- Cada ajuste debe comenzar exactamente con:
  "AJUSTE DE ACCESO —"
- Cada ajuste debe indicar:
  barrera atendida, acción docente, aplicación concreta y resultado observable.
- Utiliza demostraciones, instrucciones verbales breves, repetición, ubicación adecuada, ajuste de distancia, ritmo o espacio.
- Utiliza exclusivamente los materiales indicados por el docente.
- No inventes pictogramas, carteles, tarjetas, fichas, teléfonos, grabaciones, audífonos, colchonetas ni otros recursos no proporcionados.
- Cuando no existan materiales visuales o escritos, utiliza explicación verbal, demostración y modelado entre pares.

VARIANTES DE EJECUCIÓN Y PARTICIPACIÓN

- Incluye exactamente 3 variantes breves.
- Cada variante debe comenzar exactamente con:
  "VARIANTE DE PARTICIPACIÓN —"
- Cada variante debe mantener el mismo aprendizaje esencial.
- Puede ajustar distancia, velocidad, complejidad, cantidad de intentos, tamaño de zona, tiempo de ejecución o nivel inicial.
- Toda opción debe conservar una evidencia observable equivalente.
- Si la habilidad es motriz, ninguna variante puede eliminar totalmente la ejecución motriz.
- Las opciones deben permitir progresar hacia la tarea original cuando sea pedagógicamente adecuado.
- No separes innecesariamente al estudiante del grupo.
- No organices filas, esperas, eliminaciones ni roles pasivos.

APOYOS DEL DOCENTE Y DE LOS COMPAÑEROS

- Incluye exactamente 4 apoyos breves:
  dos apoyos del docente y dos apoyos entre compañeros.
- Los apoyos deben comenzar exactamente con uno de estos encabezados:
  "APOYO DOCENTE —"
  "APOYO ENTRE COMPAÑEROS —"
- El apoyo docente puede incluir demostración, indicación verbal, retroalimentación, ajuste de ritmo, distancia o ubicación.
- El apoyo entre compañeros debe limitarse a modelado, recordatorio verbal, observación, acompañamiento seguro o retroalimentación respetuosa.
- El compañero no debe realizar la tarea en lugar del estudiante ni decidir por él.
- No propongas guía manual, manipulación corporal, sujeción de brazos o piernas ni contacto físico no solicitado.
- Utiliza vocabulario pedagógico en español. No escribas "coach" ni "feedback".

ORGANIZACIÓN Y PARTICIPACIÓN

- Todos los estudiantes deben mantener una función activa.
- La cantidad de grupos, zonas y recursos debe coincidir con logisticsPlan.
- No declares más zonas simultáneas con implementos que materiales disponibles.
- Si existen menos materiales que estudiantes o grupos, organiza alternancia activa con tareas motrices complementarias.
- Cuando un grupo tenga 5 estudiantes, asigna funciones activas a los 5 o explica qué función comparten y qué realiza cada uno.
- La elección de roles corresponde solamente al rol inicial; después todos deben rotar.
- Evita expresiones como "espera pasiva", "en espera", "hace fila" o "aguarda su turno", incluso para negarlas.

EVALUACIÓN, SEGUIMIENTO Y SEGURIDAD

- La última sección debe contener exactamente 5 elementos, en este orden:
  1. "Evidencia esencial:"
  2. "Criterios observables:"
  3. "Seguimiento:"
  4. "Retroalimentación:"
  5. "Seguridad:"
- La evidencia esencial debe coincidir con el aprendizaje conservado.
- Los criterios deben ser concretos, observables e inclusivos.
- El seguimiento debe realizarse durante la participación activa y no mediante una demostración final individual que produzca filas.
- La retroalimentación debe ser breve, específica, respetuosa y centrada en el progreso.
- La seguridad debe incluir organización del espacio, control de desplazamientos y uso adecuado de los materiales.
- No utilices marcadores pendientes como "X intentos", "N repeticiones", "cantidad por definir" o valores sin completar.
- Todas las cantidades deben ser concretas, posibles y coherentes con el tiempo disponible.

CALIDAD PEDAGÓGICA Y USO DE RECURSOS

- El silbato se utiliza exclusivamente para iniciar, detener, señalar rotaciones o advertir una situación de riesgo.
- No utilices "silbatazos suaves" ni el silbato para marcar el ritmo técnico de la ejecución.
- Utiliza palabras como "ritmo" o "velocidad de ejecución"; no escribas "tempo".
- Si no se proporcionaron hojas, fichas, lápices, tablas o cuadernos, el seguimiento debe realizarse mediante observación docente, comprobación oral o retroalimentación entre pares. No propongas anotaciones ni registros escritos.
- Cuando exista un solo implemento para un grupo de 5 estudiantes, utiliza microturnos de 2 o 3 ejecuciones y cambia las funciones inmediatamente. No asignes 6 u 8 intentos consecutivos a una sola persona.
- Las funciones de contar, observar o corregir deben combinarse con una acción motriz segura, como practicar el gesto sin balón, ajustar la posición corporal o realizar desplazamientos controlados.
- En grupos de 5 estudiantes, deben existir cinco acciones simultáneas claramente explicadas; no dejes al quinto integrante sin tarea.
- Escribe siempre "retroalimentación inmediata", "retroalimentación breve" y "retroalimentación respetuosa", respetando la concordancia gramatical.
- Para el pase de pecho en baloncesto, describe balón frente al pecho, codos inicialmente flexionados, extensión de brazos y acompañamiento final de manos y muñecas. No indiques "codos altos" ni que el balón se impulsa con los codos.
- Escribe todas las palabras completas. No utilices abreviaturas truncadas como "recept.", "est." o "ejec.".
- Escribe "zonas delimitadas por conos"; no utilices expresiones incorrectas como "estaciones escoltadas por conos".
- Cuando se muestre una corrección técnica, escribe "demostrar visualmente el ajuste técnico sin contacto físico"; evita la expresión ambigua "mostrar el ajuste físico".

DUA Y CAMPOS ESTRUCTURADOS

- Si DUA está activado, integra los principios de REPRESENTACIÓN, ACCIÓN Y EXPRESIÓN y COMPROMISO / MOTIVACIÓN dentro de las seis secciones; no crees una sección DUA adicional.
- No escribas nombres de propiedades técnicas, metadatos ni valores booleanos en el contenido visible.
- El campo "rubric" debe ser null.
- El campo "durationPlan" debe ser null.
- El campo "logisticsPlan" debe reflejar la organización real y declarar cero participantes en espera.
`,

  "physical-circuit": `
INSTRUCCIONES ESPECÍFICAS PARA CREAR CIRCUITO FÍSICO

PROPÓSITO GENERAL

- Diseña un circuito físico seguro, progresivo, inclusivo y viable.
- Respeta literalmente el tema, nivel educativo, grado o curso, duración, cantidad de estudiantes, materiales disponibles y destreza curricular indicada.
- No añadas capacidades, deportes, técnicas o materiales no solicitados.
- El circuito debe organizarse mediante estaciones reales y simultáneas.
- Todos los estudiantes deben mantener una función motriz activa. No organices filas, eliminaciones ni esperas pasivas.
- No escribas la expresión "espera pasiva", ni siquiera para indicar que se evita. Describe directamente qué función motriz realiza cada estudiante.

ESTRUCTURA OBLIGATORIA

Genera exactamente estas ocho secciones, con estos títulos y en este orden:

1. Objetivo y capacidades físicas trabajadas.
2. Organización general del grupo, espacio y materiales.
3. Calentamiento.
4. Estaciones del circuito.
5. Tiempos, pausas y sistema de rotación.
6. Vuelta a la calma.
7. Evaluación y control del esfuerzo.
8. Medidas de seguridad.

No combines secciones, no cambies sus títulos y no agregues secciones adicionales.
El arreglo sections debe tener longitud 8 desde la primera respuesta. No omitas ninguna sección aunque debas resumir el contenido.

Utiliza exactamente esta estructura para sections:

1. { title: "Objetivo y capacidades físicas trabajadas", content: [...] }
2. { title: "Organización general del grupo, espacio y materiales", content: [...] }
3. { title: "Calentamiento", content: [...] }
4. { title: "Estaciones del circuito", content: ["Estación 1 — ...", "Estación 2 — ...", "Estación 3 — ...", "Estación 4 — ..."] }
5. { title: "Tiempos, pausas y sistema de rotación", content: [...] }
6. { title: "Vuelta a la calma", content: [...] }
7. { title: "Evaluación y control del esfuerzo", content: [...] }
8. { title: "Medidas de seguridad", content: [...] }

Los números anteriores explican el orden; no deben escribirse dentro de title.
Mantén cada sección compacta. Es preferible resumir a eliminar, combinar o crear una sección.

OBJETIVO Y CAPACIDADES

- Formula un objetivo observable y evaluable.
- Relaciona el objetivo exclusivamente con el tema solicitado.
- Identifica las capacidades o habilidades realmente desarrolladas.
- No presentes como capacidad física un ejercicio, material o nombre de estación.
- Conserva literalmente la destreza curricular proporcionada por el docente.

ORGANIZACIÓN GENERAL

- Si el docente no solicita expresamente otra cantidad, utiliza exactamente 4 estaciones.
- No crees una estación por cada grupo. Cuando existan más grupos que estaciones, asigna varios grupos a cada estación con tareas simultáneas y espacio suficiente.
- Para 40 estudiantes, utiliza preferentemente 8 grupos de 5 y 2 grupos activos en cada una de las 4 estaciones.
- La sección "Organización general del grupo, espacio y materiales" debe comenzar indicando de forma visible: "Duración de organización y explicación inicial: X minutos".
- Esa duración debe coincidir con el bloque correspondiente de durationPlan.
- Cuando la duración total solicitada sea 45 minutos, asigna exactamente 5 minutos a la organización y explicación inicial, salvo que el docente solicite expresamente otra distribución.
- Los 5 minutos iniciales deben formar parte de la suma total; no los añadas fuera de los 45 minutos.

- Indica expresamente:
  - cantidad total de estudiantes;
  - número de grupos;
  - estudiantes por grupo;
  - número de estaciones;
  - grupos asignados por estación;
  - distribución del espacio;
  - materiales asignados;
  - participación simultánea;
  - función motriz simultánea de todos los integrantes.
- La organización visible debe coincidir exactamente con el plan estructurado.
- El plan estructurado debe declarar cero participantes en espera, sin mostrar nombres de propiedades técnicas en el contenido destinado al docente.
- La cantidad estructurada de estudiantes debe coincidir con la cantidad solicitada.
- La cantidad estructurada de estaciones debe coincidir con el número real de estaciones desarrolladas.
- Si existen más grupos que estaciones, explica qué grupos comparten cada estación y cómo todos sus integrantes mantienen una tarea motriz activa.
- No declares más zonas, estaciones, balones, objetivos fijos o implementos de los realmente disponibles.
- Si el espacio no fue especificado, utiliza la expresión "espacio escolar disponible".
- Utiliza exclusivamente los materiales indicados por el docente.

CALENTAMIENTO

- Describe un calentamiento progresivo, relacionado con las capacidades del circuito y apropiado para el nivel educativo.
- Indica claramente su duración en minutos.
- Todos los estudiantes deben participar simultáneamente.
- Evita filas, eliminaciones, cargas máximas, contacto físico no solicitado y ejercicios de riesgo.
- No utilices materiales que deban reservarse para las estaciones si eso genera inconsistencias logísticas.

ESTACIONES DEL CIRCUITO

- Desarrolla exactamente la misma cantidad de estaciones declarada en el plan estructurado.
- "Estaciones del circuito" debe ser la única sección dedicada a las estaciones.
- Nunca utilices "Estación 1", "Estación 2" u otra estación como título de una sección.
- Dentro de la sección "Estaciones del circuito", coloca todas las estaciones exclusivamente como elementos separados de content.
- Cada estación debe aparecer una sola vez.
- Cada estación debe ocupar un elemento independiente del arreglo content.
- Procura que cada elemento de estación tenga un máximo de 150 palabras. Utiliza frases breves y evita repeticiones, pero nunca omitas datos pedagógicos esenciales ni la sección final de seguridad para reducir la extensión.
- Cada elemento debe comenzar exactamente con:
  "Estación 1 —", "Estación 2 —", "Estación 3 —", etc.
- La numeración debe ser consecutiva, sin saltos, repeticiones ni estaciones opcionales.
- No crees subsecciones, continuaciones ni resúmenes que repitan las estaciones.

Cada estación debe incluir de manera compacta:

- Capacidad o habilidad:
- Tarea:
- Organización:
- Participación simultánea:
- Tiempo de trabajo:
- Recuperación activa:
- Materiales:
- Variante de menor intensidad:
- Progresión de mayor desafío:
- Criterio observable:

- La recuperación debe ser activa, segura y estar incluida dentro del tiempo de la estación.
- Distingue el bloque total de la estación del trabajo efectivo. Si el bloque dura 5 minutos e incluye 30 segundos de recuperación activa, escribe: "Bloque total: 5 minutos; trabajo efectivo: 4 minutos 30 segundos; recuperación activa incluida: 30 segundos". Nunca presentes 5 minutos de trabajo más 30 segundos adicionales.
- Los cambios de roles también deben estar incluidos dentro del tiempo declarado.
- Si una estación no utiliza materiales, escribe "Materiales: sin implementos".
- En todas las estaciones incluye literalmente la etiqueta "Materiales:" seguida de los implementos realmente utilizados. No sustituyas esta etiqueta únicamente por "Balones asignados".
- Escribe la información una sola vez y exactamente en este orden: "Balones asignados: N; Materiales: ...". Nunca escribas "Materiales: Balones asignados: N; Materiales: ...".
- Cuando N sea mayor que cero, repite esos balones dentro de la descripción pedagógica de materiales. Ejemplo: "Balones asignados: 2; Materiales: 2 balones y conos". Cuando N sea cero, no menciones balones dentro de "Materiales".
- Si un grupo tiene 5 integrantes, describe expresamente qué hacen simultáneamente los 5.
- Un estudiante que cuenta, observa, comunica o controla debe combinar esa función con una acción motriz segura.
- No asignes a un estudiante la función de controlar, medir o cronometrar el tiempo si no existe cronómetro entre los materiales. En ese caso puede contar repeticiones verbalmente mientras mantiene una acción motriz segura; el docente dirige los cambios con el silbato.
- No utilices expresiones como "los demás esperan", "fila", "turno de espera", "descansa mientras observa" o equivalentes.
- No propongas estaciones opcionales, condicionales o incompletas.

ASIGNACIÓN EXACTA DE BALONES

- Si el docente proporciona balones, cada estación debe declarar literalmente "Balones asignados: N", incluso cuando N sea 0.
- La suma de los balones asignados a todas las estaciones debe ser exactamente igual a la cantidad disponible indicada por el docente.
- No asignes un balón a una estación que no incluya una acción real con balón. Cada balón asignado debe utilizarse en la tarea descrita durante ese mismo circuito.
- No utilices expresiones condicionales como "si se dispone", "si hay balón" o "cuando se use". Decide y muestra la asignación real desde el inicio.
- Un balón solo puede sostener una acción dependiente del balón en un mismo instante. No indiques simultáneamente que una persona dribla mientras otra pasa o lanza con ese mismo balón.
- Cuando dos grupos compartan una estación con un solo balón, utiliza una de estas organizaciones válidas:
  1. un grupo utiliza el balón y el otro realiza simultáneamente una tarea motriz concreta sin balón durante todo el bloque; o
  2. ambos grupos intercambian el balón en microturnos y se explica qué tarea motriz realiza el grupo que está sin balón.
- No es obligatorio que ambos grupos utilicen el balón si los dos mantienen tareas activas, seguras y relacionadas con el objetivo.
- Si escribes que dos parejas realizan pases con un solo balón, indica obligatoriamente microturnos o alternancia explícita y explica la tarea motriz concreta de la pareja que permanece momentáneamente sin balón.
- Si una estación recibe dos balones y participan dos grupos, declara expresamente un balón para cada grupo.
- Cuando un grupo de 5 realice pases en parejas, organiza dos parejas y asigna al quinto estudiante una función motriz activa de apoyo; explica su tarea y la rotación de roles.
- Quienes estén momentáneamente sin balón deben ejecutar una tarea motriz concreta, segura y relacionada con el objetivo; no deben simular pases contra una pared imaginaria.
- No escribas "pases simulados sin balón". Sustituye esa acción por desplazamientos, postura de recepción, coordinación de pies o gesto técnico de pase sin implemento.
- La asignación de balones descrita en las estaciones debe coincidir con la organización general y con los recursos del plan estructurado.

TIEMPOS Y ROTACIÓN

- Explica una ruta de rotación completa y visible, por ejemplo:
  E1 → E2 → E3 → E4 → E1.
- Todos los grupos deben cambiar simultáneamente a la siguiente estación.
- Incluye literalmente esta oración en la sección de tiempos y rotación: "Todos los grupos cambian simultáneamente a la estación siguiente siguiendo la ruta indicada".
- Distingue claramente:
  - rotación de estaciones;
  - cambio de funciones dentro de cada grupo.
- Indica:
  - cantidad de ciclos;
  - minutos por ciclo;
  - tiempo de trabajo;
  - recuperación activa;
  - transición;
  - tiempo total del circuito.
- La recuperación activa y la transición deben disponer de segundos diferentes; nunca indiques que la transición está incluida dentro de los mismos segundos de recuperación.
- La suma del trabajo efectivo, la recuperación y la transición debe coincidir exactamente con los minutos del ciclo. Ejemplo para un ciclo de 6 minutos: 5 minutos 15 segundos de trabajo + 30 segundos de recuperación + 15 segundos de transición.
- Todos los grupos deben visitar todas las estaciones o recorrer una organización equivalente claramente explicada.
- La cantidad de ciclos debe ser coherente con el número de estaciones.
- Cuando todos los grupos deban visitar todas las estaciones, la cantidad de ciclos debe ser exactamente igual a la cantidad de estaciones. Por ejemplo: 4 estaciones requieren 4 ciclos; no utilices 3 ciclos para una ruta de 4 estaciones.
- No afirmes que todos visitan todas las estaciones si la ruta o los ciclos no lo permiten.

DISTRIBUCIÓN TEMPORAL

- El plan temporal estructurado es obligatorio.
- La suma de sus bloques debe coincidir exactamente con la duración solicitada.
- Cada bloque temporal debe aparecer claramente en el contenido visible con su duración en minutos.
- Incluye dentro del total:
  - calentamiento;
  - explicación u organización inicial;
  - trabajo por estaciones;
  - recuperaciones;
  - cambios de funciones;
  - transiciones;
  - vuelta a la calma;
  - evaluación o reflexión final.
- Cada minuto debe pertenecer exclusivamente a un bloque.
- No agregues actividades, evaluaciones, reflexiones o comentarios después de completar la duración total.
- El tiempo total del circuito por estaciones debe incluir todos sus ciclos, recuperaciones y transiciones internas.

VUELTA A LA CALMA

- Indica claramente su duración.
- Incluye acciones de recuperación apropiadas para el nivel educativo.
- Evita ejercicios forzados, dolorosos, competitivos o realizados con contacto físico.
- Mantén una organización simultánea y segura.

EVALUACIÓN Y CONTROL DEL ESFUERZO

- Incluye criterios observables relacionados directamente con el objetivo.
- Evalúa la técnica segura, la participación, el control corporal y la regulación del esfuerzo.
- Utiliza indicadores escolares sencillos:
  - respiración controlada;
  - capacidad de hablar;
  - técnica estable;
  - recuperación breve;
  - percepción de esfuerzo expresada oralmente.
- No inventes pulsómetros, cronómetros, fichas, hojas, teléfonos ni instrumentos no proporcionados.
- Si no existen materiales para escribir, realiza seguimiento mediante observación docente, comprobación oral y retroalimentación verbal.
- La evaluación debe realizarse durante la participación activa o dentro de un bloque temporal declarado.
- Cuando durationPlan incluya un bloque independiente de evaluación, comienza esta sección con "Duración de la evaluación: X minutos" y realiza la evaluación después de la vuelta a la calma. No indiques que esos minutos ocurren dentro o durante la vuelta a la calma.
- Cada minuto de evaluación debe pertenecer a un solo bloque temporal. No contabilices la evaluación como bloque independiente y, al mismo tiempo, como parte de la vuelta a la calma.
- Comprueba que la retroalimentación de todos los grupos quepa dentro del tiempo de evaluación. Para 8 grupos y 5 minutos, utiliza como máximo 30 segundos por grupo y reserva el minuto restante para instrucciones y cierre común.
- Para 8 grupos y un bloque final de 2 minutos, utiliza una respuesta oral simultánea o un máximo de 10 segundos por grupo; no asignes 30 segundos consecutivos a cada grupo.

SEGURIDAD

- Incluye medidas concretas relacionadas con:
  - separación entre estaciones;
  - dirección de desplazamiento;
  - control de cruces;
  - uso responsable de materiales;
  - técnica segura;
  - hidratación cuando corresponda;
  - señales para iniciar, detener y rotar;
  - suspensión de una tarea si aparece dolor, mareo o pérdida de control técnico.
- No propongas castigos físicos, cargas máximas, contacto físico innecesario, empujones, desplazamientos a ciegas ni ejercicios de alto riesgo.
- Redacta las medidas de seguridad en forma positiva, describiendo únicamente la conducta segura que debe realizarse. No copies ni enumeres dentro del contenido visible la lista anterior de prácticas prohibidas.
- El silbato será utilizado exclusivamente por el docente para iniciar, detener, señalar rotaciones o advertir un riesgo.

MATERIALES Y VIABILIDAD

- Utiliza exclusivamente los materiales escritos por el docente.
- No inventes pesas, vallas, colchonetas, bandas elásticas, escaleras de coordinación, cronómetros, carteles, fichas, hojas, tarjetas, teléfonos ni grabaciones.
- No propongas steps, bancos, plataformas ni implementos improvisados cuando no aparezcan expresamente entre los materiales disponibles. Si solo existen conos, realiza los saltos en el lugar dentro de un espacio delimitado por conos.
- La suma de materiales asignados simultáneamente a las estaciones no puede superar la cantidad disponible.
- Cuando se proporcionen balones, utiliza la cantidad declarada y distribúyela exactamente mediante "Balones asignados: N" en cada estación.
- No declares que un mismo implemento se utiliza simultáneamente en dos estaciones diferentes.
- Cuando falten implementos, utiliza tareas equivalentes sin material y funciones motrices activas.
- Evita repetir información organizativa y de seguridad dentro de cada estación. Mantén las ocho secciones suficientemente compactas para que el documento pueda imprimirse preferentemente en dos páginas A4.

DUA Y NEE

- Si DUA está activado, integra dentro de las ocho secciones:
  - una estrategia de REPRESENTACIÓN;
  - una estrategia de ACCIÓN Y EXPRESIÓN;
  - una estrategia de COMPROMISO / MOTIVACIÓN.
- No agregues una novena sección DUA.
- Si NEE está activado, incluye apoyos concretos mediante demostraciones, instrucciones breves, ajustes de ritmo, distancia o espacio y apoyo verbal entre compañeros.
- No separes innecesariamente al estudiante del grupo.
- No propongas guía manual, manipulación corporal ni contacto físico.

LENGUAJE Y CAMPOS ESTRUCTURADOS

- Redacta todo el contenido en español.
- Utiliza "retroalimentación" y no "feedback".
- Utiliza "carreras de ida y vuelta" o "recorridos de ida y vuelta" y nunca "shuttle run", "shuttle runs" ni "shuttles".
- Utiliza "aceleración corta" y nunca "sprint". Utiliza "recorrido en zigzag" y nunca "slalom".
- Mantén la concordancia singular y plural: escribe "1 balón" y "2 balones". Nunca escribas "1 balones".
- Escribe "dos parejas y un estudiante de apoyo activo" en lugar de "sub-subgrupos (2+2+1)".
- Utiliza "resistencia aeróbica moderada" y no "resistencia aeróbica local".
- No muestres la frase técnica "participantes en espera: 0"; expresa de forma pedagógica que ningún estudiante queda sin función motriz.
- Utiliza "ritmo que permita conversar" y no "ritmo conversaciónable".
- Utiliza "carreras" y no "corridas".
- Utiliza "comprobación de la respiración controlada" y no "palpación de respiración controlada".
- Utiliza "estabilidad dinámica de la zona media" y no "core dinámico".
- Describe "aterrizajes controlados después de los saltos"; no escribas "absorción en saltos y contactos".
- Revisa que no aparezcan palabras deformadas, truncadas o sin significado como "alugo".
- No escribas nombres de propiedades técnicas, valores booleanos, restricciones internas ni metadatos en el contenido visible.
- Tampoco escribas variantes separadas, traducidas o con guion bajo de esas propiedades, como "waiting participants", "waiting_participants" o "simultaneous participants".
- El campo rubric debe ser null.
- Los planes estructurados de organización y duración deben ser coherentes con todas las secciones visibles.
- Antes de devolver la respuesta, verifica que sections contenga exactamente los ocho títulos obligatorios. La sección "Medidas de seguridad" nunca debe omitirse, aunque sea necesario resumir otras secciones.
`,
};

export function getToolPromptInstructions(toolId: AIToolId): string {
  return TOOL_PROMPT_INSTRUCTIONS[toolId].trim();
}
