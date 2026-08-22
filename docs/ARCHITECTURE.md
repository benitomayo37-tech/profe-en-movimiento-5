# Profe en Movimiento 5.0

# Arquitectura Oficial del Proyecto

Versión: v0.1 – Foundation

---

# 1. Filosofía de la arquitectura

La arquitectura de Profe en Movimiento 5.0 está diseñada bajo cinco principios fundamentales:

- Escalabilidad.
- Reutilización.
- Mantenibilidad.
- Rendimiento.
- Simplicidad.

Cada decisión técnica deberá respetar estos principios.

---

# 2. Stack tecnológico

## Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

## Backend (planificado)

- Next.js Route Handlers
- API REST
- Server Actions

## Base de datos (planificada)

- PostgreSQL

## ORM (planificado)

- Prisma

## Autenticación (planificada)

- Auth.js

## Almacenamiento

- Cloud Storage

## Hosting

- Vercel

---

# 3. Organización del proyecto

```
profe-en-movimiento-5

app
components
docs
features
hooks
lib
public
services
styles
types
utils
```

Cada carpeta tiene una única responsabilidad.

---

# 4. Carpeta app

Contiene todas las rutas del proyecto.

Ejemplo:

```
app

page.tsx

resources

academy

store

ai

dashboard

contact
```

Nunca colocaremos lógica de negocio aquí.

Las páginas únicamente organizan componentes.

---

# 5. Carpeta components

Contiene componentes reutilizables.

Se divide en:

```
components

layout

ui

home

shared
```

## layout

Componentes generales:

- Navbar
- Footer
- Sidebar
- Header

## ui

Sistema de diseño.

Ejemplos:

- Button
- Card
- Container
- SearchBar
- Badge
- Modal
- Input
- Select

## home

Componentes exclusivos del Inicio.

Ejemplo:

- Hero
- Services
- Testimonials
- FAQ

## shared

Componentes utilizados por distintos módulos.

---

# 6. Carpeta features

Aquí vive la lógica funcional.

Ejemplo:

```
features

resources

academy

ai

store

dashboard
```

Cada módulo es independiente.

Ejemplo:

```
resources

components

hooks

services

types

utils
```

Esto facilita el crecimiento del proyecto.

---

# 7. Carpeta hooks

Contendrá hooks personalizados.

Ejemplos futuros:

```
useSearch

usePagination

useFavorites

useAuth

useCourses

useResources
```

---

# 8. Carpeta lib

Configuraciones generales.

Ejemplos:

- Prisma
- Auth
- Fetch
- Helpers globales

---

# 9. Carpeta services

Acceso a APIs.

Ejemplo:

```
resources.service.ts

courses.service.ts

products.service.ts
```

Nunca mezclaremos llamadas HTTP dentro de componentes.

---

# 10. Carpeta styles

Estilos globales.

Aquí vivirán:

- globals.css
- variables
- animaciones
- tipografía

---

# 11. Carpeta types

Interfaces y tipos TypeScript.

Ejemplo:

```
Resource.ts

Course.ts

Product.ts

User.ts
```

Nunca duplicaremos tipos.

---

# 12. Carpeta utils

Funciones auxiliares.

Ejemplo:

```
formatDate()

slugify()

truncate()

downloadFile()
```

---

# 13. Carpeta public

Archivos públicos.

```
logos

icons

images

videos

downloads
```

---

# 14. Flujo de desarrollo

Cada nueva funcionalidad seguirá este proceso:

Idea

↓

Diseño

↓

Arquitectura

↓

Componentes

↓

Página

↓

Pruebas

↓

Documentación

---

# 15. Reglas de componentes

Cada componente debe:

- Tener una sola responsabilidad.
- Ser reutilizable cuando sea posible.
- Utilizar TypeScript.
- Ser responsive.
- Mantener accesibilidad.
- Evitar lógica innecesaria.

---

# 16. Convenciones

## Componentes

PascalCase

Ejemplo:

```
Hero.tsx

SearchBar.tsx

ResourceCard.tsx
```

---

## Hooks

camelCase

```
useSearch.ts

useAuth.ts
```

---

## Tipos

PascalCase

```
Resource.ts

User.ts
```

---

## Utilidades

camelCase

```
formatDate.ts

slugify.ts
```

---

# 17. Principios de desarrollo

Nunca copiar código.

Siempre reutilizar.

Nunca crear componentes enormes.

Siempre dividir responsabilidades.

Nunca mezclar estilos con lógica compleja.

Siempre documentar decisiones importantes.

---

# 18. Gestión de versiones

Seguiremos versionado semántico:

v0.x

Durante desarrollo.

v1.0

Primer lanzamiento estable.

v2.0

Grandes mejoras estructurales.

---

# 19. Calidad del código

Antes de cerrar un Sprint verificaremos:

- Compila correctamente.
- No hay errores TypeScript.
- Responsive.
- Accesibilidad.
- Código limpio.
- Componentes reutilizables.
- Documentación actualizada.

---

# 20. Objetivo de esta arquitectura

Construir una plataforma capaz de crecer durante años sin necesidad de reorganizar completamente el proyecto.

Cada nueva funcionalidad deberá integrarse respetando esta arquitectura para mantener un código limpio, consistente y escalable.

---

**Profe en Movimiento Labs**

Arquitectura oficial del proyecto.