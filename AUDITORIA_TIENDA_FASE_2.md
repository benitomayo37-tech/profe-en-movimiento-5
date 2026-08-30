# Integración de tienda y aplicaciones — Fase 2

Fecha: 28 de agosto de 2026  
Proyecto: Profe en Movimiento 5.0

## Resultado

- Ajedrez Interactivo fue retirado del catálogo comercial.
- Ajedrez desde Cero aparece en `Estudiantes → Juegos Interactivos` con estado `En preparación`.
- Creador de Juegos fue incorporado como aplicación Pro protegida.
- Desagregador DCD fue incorporado mediante su versión responsive.
- Las versiones móvil y escritorio del Creador de Juegos resultaron idénticas; se conserva un solo archivo.
- Los HTML están dentro de `private/miniapps`, no en `public`.
- La API valida sesión y acceso Pro antes de entregar los archivos.

## Hallazgo de empaquetado

El ZIP recibido no contenía la carpeta `private/miniapps`, aunque el catálogo existente declara varias herramientas alojadas allí. El build no detecta la ausencia porque esos archivos se leen en tiempo de ejecución. Esta fase incorpora únicamente los dos archivos revisados; no afirma que las demás miniapps privadas estén presentes.

## Verificación

- ESLint: aprobado en los archivos modificados.
- TypeScript: aprobado.
- Next.js 16.2.11: build aprobado.
- Páginas generadas: 47/47.
- Fichas de tienda: 24.

## Prueba recomendada

1. Iniciar sesión con cuenta Pro o administradora.
2. Abrir `/apps/creador-juegos-docentes`.
3. Generar, copiar y reiniciar una propuesta.
4. Probar en un ancho móvil.
5. Abrir `/apps/desagregador-destrezas`.
6. Desagregar una DCD y probar el copiado.
7. Entrar en `/estudiantes/juegos-interactivos` y comprobar que Ajedrez figure como `En preparación` sin botón de inicio.
8. Entrar en `/store` y confirmar que Ajedrez ya no aparezca.

## Pendiente

La ampliación completa del motor de Ajedrez, su progreso, accesibilidad y nuevas lecciones se realizará en una fase específica antes de habilitarlo.
