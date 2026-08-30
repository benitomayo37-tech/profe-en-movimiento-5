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
