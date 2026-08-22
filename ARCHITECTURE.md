# Profe en Movimiento 5.0

# Arquitectura Técnica

Versión: 1.0  
Estado: En desarrollo  
Filosofía interna: Proyecto FARO

---

# 1. Visión del producto

Profe en Movimiento 5.0 es una plataforma educativa basada en inteligencia artificial orientada a:

- Educación Física
- Deporte
- Actividad física
- Bienestar
- Formación docente
- Recursos educativos
- Herramientas de planificación y evaluación

La plataforma debe funcionar como un ecosistema modular, escalable y accesible desde navegador, dispositivos móviles y aplicaciones de escritorio.

---

# 2. Principios arquitectónicos

La arquitectura seguirá estos principios:

1. Separación de responsabilidades.
2. Modularidad por funcionalidades.
3. Componentes reutilizables.
4. Tipado estricto con TypeScript.
5. Validación de datos en los límites del sistema.
6. Lógica de negocio independiente de la interfaz.
7. APIs ligeras.
8. Seguridad desde el diseño.
9. Accesibilidad desde el diseño.
10. Compatibilidad responsive.
11. Pruebas después de cada etapa.
12. No romper funcionalidades existentes.

---

# 3. Tecnologías principales

## Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4

## Inteligencia artificial

- OpenAI API
- Responses API
- Structured Outputs
- JSON Schema
- AI Engine propio

## Futuras integraciones

- Base de datos
- Autenticación
- Almacenamiento de archivos
- Sistema de pagos
- Analíticas
- PWA
- Android
- iOS
- Windows
- macOS

---

# 4. Arquitectura general

```text
Usuario
   │
   ▼
Interfaz web
   │
   ▼
Componentes React
   │
   ▼
Features
   │
   ▼
Servicios del frontend
   │
   ▼
API Routes
   │
   ▼
Servicios de dominio
   │
   ▼
AI Engine / Base de datos / Servicios externos
```

---

# 5. Estructura principal del proyecto

```text
profe-en-movimiento-5/
├── app/
├── components/
├── features/
├── hooks/
├── lib/
├── public/
├── services/
├── styles/
├── types/
├── utils/
├── ARCHITECTURE.md
├── DESIGN_SYSTEM.md
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

# 6. Responsabilidad de cada carpeta

## `app/`

Contiene:

- rutas;
- páginas;
- layouts;
- API Routes;
- loading states;
- error states;
- metadatos.

Las rutas no deben contener lógica de negocio compleja.

---

## `components/`

Contiene componentes reutilizables globales.

```text
components/
├── ui/
├── layout/
├── shared/
└── feedback/
```

### `components/ui/`

Componentes visuales básicos:

- Button
- Card
- Badge
- Input
- Textarea
- Avatar
- IconButton
- Modal
- Dialog
- Skeleton
- Spinner

### `components/layout/`

Componentes estructurales:

- AppLayout
- Sidebar
- Header
- Footer
- MobileNavigation

### `components/shared/`

Componentes compartidos entre diferentes módulos.

### `components/feedback/`

Estados y retroalimentación:

- Alert
- Toast
- EmptyState
- ErrorState
- LoadingState

---

## `features/`

Contiene la lógica organizada por dominio funcional.

```text
features/
├── ai/
├── home/
├── dashboard/
├── resources/
├── academy/
├── store/
├── community/
├── health/
├── sports/
├── profile/
└── app-profes/
```

Cada feature puede contener:

```text
feature-name/
├── components/
├── data/
├── hooks/
├── schemas/
├── services/
├── types/
└── utils/
```

Una feature no debe depender directamente de detalles internos de otra feature.

---

## `hooks/`

Hooks globales reutilizables.

Ejemplos:

- useMediaQuery
- useLocalStorage
- useDebounce
- useDisclosure
- useTheme

Los hooks específicos de una funcionalidad deben permanecer dentro de su feature.

---

## `lib/`

Infraestructura y configuración técnica.

Ejemplos:

- clientes externos;
- configuración;
- utilidades de servidor;
- autenticación;
- base de datos;
- validadores globales.

---

## `services/`

Servicios compartidos que no pertenecen exclusivamente a una feature.

Ejemplos:

- analíticas;
- almacenamiento;
- notificaciones;
- exportación de documentos.

---

## `types/`

Tipos globales compartidos por varios módulos.

Los tipos exclusivos de una feature deben permanecer dentro de esa feature.

---

## `utils/`

Funciones puras y reutilizables.

No deben contener estado ni depender de React.

---

# 7. Arquitectura del módulo de inteligencia artificial

```text
features/ai/
├── assistants/
├── components/
├── core/
├── data/
├── engine/
├── prompts/
├── router/
├── schemas/
├── services/
├── types/
└── utils/
```

---

# 8. Asistentes de IA

La plataforma contará con cuatro asistentes principales.

## Profe IA

Asistente general y punto de entrada principal.

Responsabilidades:

- comprender la intención del usuario;
- dirigir la solicitud;
- seleccionar el asistente adecuado;
- ofrecer una experiencia unificada.

## ProfeGPT

Especialista en:

- Educación Física;
- planificación;
- evaluación;
- metodología;
- currículo;
- adaptaciones educativas.

## SportGPT

Especialista en:

- deporte;
- entrenamiento;
- técnica;
- táctica;
- rendimiento;
- análisis deportivo.

## SaludGPT

Especialista en:

- actividad física;
- hábitos saludables;
- bienestar;
- ejercicio responsable;
- prevención general.

No sustituirá atención médica profesional.

---

# 9. Flujo del AI Engine

```text
Solicitud
   │
   ▼
Validación de entrada
   │
   ▼
Router de asistentes
   │
   ▼
Resolución del asistente
   │
   ▼
Construcción de contexto
   │
   ▼
Construcción del prompt
   │
   ▼
OpenAI
   │
   ▼
Respuesta estructurada
   │
   ▼
Validación
   │
   ▼
Resultado + metadatos
```

---

# 10. Componentes actuales del AI Engine

```text
features/ai/engine/
├── AIEngineError.ts
├── generateWithAIEngine.ts
├── index.ts
├── isGeneratedAIContent.ts
└── types.ts
```

Responsabilidades:

- llamar al proveedor de IA;
- normalizar errores;
- validar respuestas;
- devolver contenido estructurado;
- incluir metadatos del asistente;
- mantener la API desacoplada de OpenAI.

---

# 11. Regla para las API Routes

Las API Routes deben ser capas delgadas.

Una ruta puede:

- recibir datos;
- validar formato y tamaño;
- invocar un servicio;
- transformar el resultado HTTP;
- devolver una respuesta.

Una ruta no debe:

- construir prompts complejos;
- contener lógica del dominio;
- administrar directamente asistentes;
- validar manualmente grandes estructuras;
- duplicar reglas del AI Engine.

Flujo esperado:

```text
route.ts
   │
   ▼
generateWithAIEngine()
   │
   ▼
AI Engine
```

---

# 12. Arquitectura del Dashboard

```text
DashboardPage
   │
   ▼
AppLayout
   ├── Sidebar
   ├── Header
   ├── MainContent
   └── Footer
```

Dentro del contenido principal:

```text
Dashboard
├── WelcomeSection
├── ProfeIAPrompt
├── QuickActions
├── AssistantGrid
├── RecentActivity
├── RecommendedResources
└── PlatformStats
```

---

# 13. Navegación principal

La navegación inicial incluirá:

- Dashboard
- Profe IA
- Recursos
- Academia
- Deportes
- Salud
- Tienda
- Comunidad
- Configuración

Las rutas futuras propuestas son:

```text
/dashboard
/ai
/resources
/academy
/sports
/health
/store
/community
/settings
```

---

# 14. Diseño responsive

La aplicación debe funcionar en:

- móvil;
- tablet;
- portátil;
- escritorio.

## Escritorio

- sidebar fija;
- header superior;
- contenido amplio;
- cuadrículas de varias columnas.

## Tablet

- sidebar colapsable;
- contenido adaptable;
- tarjetas de una o dos columnas.

## Móvil

- navegación compacta;
- sidebar tipo drawer;
- tarjetas en una columna;
- controles táctiles amplios.

---

# 15. Estados obligatorios

Toda funcionalidad que cargue datos debe contemplar:

- estado inicial;
- carga;
- éxito;
- vacío;
- error;
- reintento;
- deshabilitado.

No se debe mostrar una pantalla en blanco mientras ocurre un proceso.

---

# 16. Convenciones de código

## Componentes

Usar PascalCase:

```text
AssistantCard.tsx
DashboardHeader.tsx
QuickActionButton.tsx
```

## Hooks

Usar prefijo `use`:

```text
useAssistant.ts
useDashboard.ts
useMediaQuery.ts
```

## Utilidades

Usar camelCase:

```text
formatDate.ts
buildClassName.ts
normalizeError.ts
```

## Tipos

Usar nombres descriptivos:

```text
AssistantCardProps
DashboardActivity
AIEngineGenerationResult
```

---

# 17. Reglas de TypeScript

- Evitar `any`.
- Usar `unknown` para datos no confiables.
- Validar datos externos.
- Exportar tipos explícitos.
- Evitar conversiones forzadas innecesarias.
- Mantener activado el modo estricto.
- Definir tipos cerca del dominio al que pertenecen.

---

# 18. Reglas de componentes React

Cada componente debe:

- tener una responsabilidad clara;
- recibir datos por props;
- evitar lógica compleja en JSX;
- ser accesible;
- funcionar en dispositivos táctiles;
- manejar estados relevantes;
- permitir reutilización cuando sea razonable.

No se debe convertir todo en un componente genérico si solo se usa una vez y no aporta claridad.

---

# 19. Seguridad

La plataforma deberá aplicar:

- variables de entorno para secretos;
- claves de API solo en servidor;
- validación de entrada;
- límites de tamaño;
- control de errores;
- sanitización cuando sea necesaria;
- protección de rutas;
- autorización por roles;
- registros sin datos sensibles.

Nunca deben exponerse claves privadas en código del cliente.

---

# 20. Accesibilidad

Cada interfaz debe incluir:

- HTML semántico;
- navegación por teclado;
- estados de foco visibles;
- contraste suficiente;
- etiquetas accesibles;
- mensajes de error claros;
- textos alternativos;
- áreas táctiles adecuadas;
- soporte para lectores de pantalla.

---

# 21. Rendimiento

Se aplicarán estas reglas:

- componentes de servidor por defecto;
- componentes de cliente solo cuando sean necesarios;
- carga diferida;
- optimización de imágenes;
- evitar dependencias pesadas;
- reducir JavaScript enviado al navegador;
- reutilizar datos cuando sea posible;
- usar skeletons durante cargas visibles.

---

# 22. Estrategia de pruebas

Después de cada paso se ejecutará:

```bash
npm run build
```

En etapas posteriores se incorporarán:

- pruebas unitarias;
- pruebas de componentes;
- pruebas de integración;
- pruebas end-to-end;
- validación de accesibilidad;
- pruebas responsive.

Ninguna refactorización debe romper funcionalidades previamente verificadas.

---

# 23. Estrategia de evolución

La plataforma crecerá por fases:

## Fase web

Aplicación Next.js responsive.

## Fase PWA

Instalable desde navegadores compatibles.

## Fase móvil

Aplicaciones para:

- Android;
- iOS.

## Fase escritorio

Aplicaciones para:

- Windows;
- macOS.

La lógica de dominio debe mantenerse reutilizable para facilitar esta evolución.

---

# 24. Proyecto FARO

FARO representa la filosofía de desarrollo:

- Fiabilidad
- Aprendizaje
- Responsabilidad
- Optimización

Cada decisión técnica y funcional deberá contribuir a uno o más de estos principios.

---

# 25. Regla de mantenimiento

Antes de agregar una funcionalidad se deberá responder:

1. ¿A qué problema real responde?
2. ¿A qué módulo pertenece?
3. ¿Puede reutilizar algo existente?
4. ¿Introduce una dependencia innecesaria?
5. ¿Es accesible?
6. ¿Es segura?
7. ¿Funciona en móvil?
8. ¿Puede mantenerse a largo plazo?

---

# 26. Estado actual

## Completado

- Proyecto Next.js.
- TypeScript.
- Tailwind CSS.
- Módulo inicial de inteligencia artificial.
- Integración con OpenAI.
- Generación estructurada.
- Registro de asistentes.
- Router.
- Assistant Resolver.
- Context Builder.
- AI Engine.
- Manejo normalizado de errores.
- Design System inicial.
- Arquitectura técnica documentada.

## En desarrollo

- Integración definitiva de API Route con AI Engine.
- Sistema de diseño implementado en código.
- Layout principal.
- Dashboard inteligente.
- Navegación responsive.

---

# 27. Próximos pasos

1. Crear tokens visuales globales.
2. Preparar tipografía.
3. Instalar y configurar iconografía.
4. Crear componentes UI fundamentales.
5. Construir AppLayout.
6. Construir Sidebar.
7. Construir Header.
8. Crear Dashboard.
9. Integrar Profe IA.
10. Validar responsive y accesibilidad.