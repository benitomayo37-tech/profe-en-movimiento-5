# Alimentación en Movimiento

Herramienta docente PRO reconstruida para Profe en Movimiento 5.0.

## Integración

1. Copia las carpetas `features` del paquete sobre la carpeta `features` del proyecto.
2. Conserva la estructura de subcarpetas.
3. Reinicia el servidor con `npm run dev`.
4. Abre **App para profes**.
5. Filtra por **Deporte y salud** y abre **Alimentación en Movimiento**.

No necesita migración de Supabase ni nuevas variables de entorno.

## Funciones incorporadas

- 30 lecciones verificadas.
- Preparatoria, EGB Elemental, EGB Media, EGB Superior y BGU.
- Búsqueda y filtro por módulos.
- Favoritos.
- Progreso guardado en el dispositivo.
- Última lección consultada.
- Notas privadas locales.
- Tres preguntas formativas por lección.
- Lección completada únicamente con las tres respuestas y al menos 2/3.
- Ficha de clase de 45 minutos.
- Impresión de la ficha actual.
- DUA con Representación, Acción y Expresión, y Compromiso e Implicación.
- Tema claro, sepia y nocturno.
- Ajuste de tamaño del texto.
- Enlaces a fuentes orientadoras.
- Borrado completo de datos locales.
- Identidad editorial inspirada en la aplicación original: logo, navy, naranja, tarjetas visuales e iconografía destacada.
- Laboratorio visual interactivo para construir el mensaje clave de cada lección.
- Pantalla inicial de biblioteca con las 30 lecciones organizadas en tarjetas por módulos.
- Las fichas se abren en una ventana amplia sobre la biblioteca desenfocada, como en la aplicación original.
- Cabecera fija, cierre rápido y desplazamiento interno dentro de cada ficha.
- Recursos visuales adaptables: plato saludable flexible, guía alimentaria tipo pirámide, hidratación y lectura del semáforo nutricional.
- Infografía contextual para las demás lecciones, sin depender de imágenes externas.

## Correcciones de seguridad

- Eliminada la calculadora de IMC infantil.
- Eliminada la fórmula `peso × 35 ml`.
- Eliminadas mediciones de peso y talla.
- Eliminadas pirámides humanas y actividades con vendas.
- Eliminados concursos de loncheras y comparaciones familiares.
- El semáforo se utiliza para interpretar nutrientes, no para clasificar alimentos o personas.
- Incluye alergias, higiene, conservación, autorización y alternativas sin degustación.
- La sección de señales de alerta orienta a acompañar y derivar, nunca a diagnosticar.
- La herramienta no prescribe dietas ni sustituye atención profesional.

## Verificación

- TypeScript correcto.
- ESLint correcto en todos los archivos modificados.
- Compilación de producción correcta.
- 47 rutas generadas.
