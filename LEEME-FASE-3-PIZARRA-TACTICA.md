# Tienda · Fase 3 · Pizarra Táctica Multideporte

## Resultado

- Pizarra Táctica Multideporte integrada como miniapp Pro.
- Acceso disponible en `/apps/pizarra-tactica-multideporte`.
- Archivo servido desde `private/miniapps` mediante la API protegida.
- Usuarios sin sesión o sin Plan Pro no reciben el HTML de la herramienta.
- Cinco deportes incluidos: baloncesto, fútbol, futsal, ecuavóley y voleibol.
- Controles con eventos de puntero para ratón y pantalla táctil.
- Ficha de tienda actualizada de `Próximamente` a `Incluida`.
- Comunicación comercial actualizada a `Suite Pro de miniapps`, sin una cifra fija.
- El identificador interno `suite-19-miniapps-docentes` se conserva para no romper el checkout configurado en Hotmart.

## Verificación técnica

- ESLint: aprobado.
- TypeScript: aprobado.
- Next.js 16.2.11: build aprobado.
- Páginas generadas: 47/47.
- Fichas de tienda: 24.

## Prueba recomendada

1. Iniciar sesión con una cuenta Pro o administradora.
2. Abrir `/apps` y seleccionar `Pizarra Táctica Multideporte`.
3. Cambiar entre los cinco deportes.
4. Arrastrar jugadores con ratón y con pantalla táctil.
5. Dibujar un trazo, una flecha y una línea punteada.
6. Probar deshacer, borrar, cargar jugadas y guardar una jugada.
7. Abrir la ficha `/store/pizarra-tactica-multideporte` y comprobar la etiqueta `Incluido`.
8. Probar con una cuenta Free y confirmar que aparece la solicitud de Plan Pro.

