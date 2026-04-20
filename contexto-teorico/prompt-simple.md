Actúa como un senior full-stack engineer especializado en secure web development, Docker y proyectos MVP académicos orientados a ciberseguridad.

Quiero que diseñes e implementes un proyecto final de “Puesta en Producción Segura” con el objetivo de que sea lo más pequeño posible, pero cumpliendo correctamente todos los requisitos obligatorios.

Objetivo del proyecto:
Construir una aplicación web mínima, funcional y fácilmente replicable en distintos PCs usando Docker, evitando complejidad innecesaria. No quiero una app grande ni un SaaS complejo. Quiero un prototipo pequeño, claro, funcional y defendible.

Dominio del proyecto:
Aplicación web mínima de soporte IT / service desk multi-tenant.

Importante:
El proyecto debe ser deliberadamente pequeño. Solo debe incluir lo imprescindible para demostrar:
- autenticación OAuth 2
- autorización RBAC y ABAC
- despliegue reproducible con Docker
- integración con Supabase y Render
- uso de SonarQube
- uso de OWASP Dependency-Check
- uso de OWASP ZAP
- uso de gestión de secretos

Requisitos obligatorios:
- Autenticación OAuth 2
- Gestión de autorización RBAC y ABAC
- Uso de herramientas SAST con SonarQube
- Análisis RCA/SCA con OWASP Dependency-Check
- Análisis DAST con OWASP ZAP
- Despliegue usando Render.com y Supabase
- Uso de herramientas de gestión de secretos

Restricción principal:
Quiero el proyecto lo más pequeño posible.
Eso significa:
- mínimo número de pantallas
- mínimo número de entidades
- mínimo número de módulos
- mínimo número de dependencias
- mínimo código posible sin romper claridad ni seguridad
- nada de features “bonitas” o secundarias
- nada de sobreingeniería
- nada de microservicios
- nada de arquitectura enterprise innecesaria

Enfoque técnico obligatorio:
Quiero que TODO el proyecto quede dockerizado para poder levantarlo fácilmente en otros ordenadores.

Eso debe incluir, si es razonable:
- aplicación web
- SonarQube
- OWASP Dependency-Check
- OWASP ZAP
- scripts o configuración para levantar el entorno fácilmente

Quiero poder ejecutar algo parecido a:
- docker compose up --build

Y tener una base funcional reproducible.

Quiero que priorices:
1. simplicidad
2. reproducibilidad
3. cumplimiento de requisitos
4. seguridad básica correcta
5. facilidad de defensa oral
6. facilidad de retomarlo en el futuro

Stack preferido:
Elige el stack más simple y realista posible para cumplir los requisitos. Prioriza:
- Next.js o React sencillo
- TypeScript
- Supabase
- Docker / Docker Compose
- Render para despliegue
- Tailwind solo si simplifica, no si complica

Si otra opción es claramente más simple para este caso, puedes elegirla, pero justifica brevemente la decisión.

Lo que quiero que construyas:
Una app web mínima donde:
- el usuario inicia sesión con OAuth 2
- pertenece a un tenant
- puede ver y crear tickets
- existen roles mínimos
- existen reglas RBAC y ABAC simples pero reales
- existe aislamiento multi-tenant
- queda preparada para análisis de seguridad
- queda dockerizada y documentada

MVP mínimo deseado:
Solo quiero lo imprescindible.

Pantallas mínimas:
- login
- dashboard simple
- listado de tickets
- creación de ticket
- detalle de ticket
- panel/admin muy básico o gestión mínima de usuarios/tenant si hace falta para demostrar roles

Entidades mínimas:
- tenants
- users
- memberships
- tickets
- ticket_comments si hace falta
- audit_logs solo si aporta valor real para defender el proyecto

Roles mínimos:
- super_admin
- tenant_admin
- support_agent
- client_user

ABAC mínimo pero visible:
- un usuario solo puede ver tickets de su tenant
- support_agent solo puede editar tickets asignados a él
- tenant_admin solo gestiona usuarios de su tenant
- ciertas acciones dependen del estado del ticket
- alguna función opcional depende del plan del tenant si hace falta para demostrar ABAC, pero solo si no complica demasiado

Quiero que organices tu respuesta en estas fases:

FASE 1. Propuesta mínima del proyecto
Define:
- nombre del producto
- resumen de 3-5 líneas
- alcance mínimo del MVP
- por qué este MVP pequeño cumple los requisitos

FASE 2. Decisión del stack
Elige el stack más simple posible.
Explica brevemente por qué.
Prioriza pocas piezas y facilidad de Docker.

FASE 3. Modelo funcional mínimo
Define:
- usuarios
- tenants
- tickets
- roles
- reglas RBAC
- reglas ABAC
- qué acciones exactas puede hacer cada rol

Hazlo simple, claro y defendible.

FASE 4. Diseño multi-tenant mínimo
Explica:
- cómo se separan los datos por tenant
- cómo se evita acceso cruzado
- cómo se aplica tenant_id
- cómo se fuerza el control tanto en backend como en base de datos si aplica

FASE 5. Modelo de datos mínimo
Diseña solo las tablas imprescindibles.
Incluye:
- nombre de tabla
- campos clave
- relaciones
- campos tenant_id donde correspondan
- campos de trazabilidad mínimos

FASE 6. Arquitectura mínima
Diseña una arquitectura lo más simple posible.
Quiero algo tipo:
- frontend/backend en una sola app si eso simplifica
- Supabase para base de datos y autenticación si encaja
- Docker Compose para entorno local
- Render para despliegue posterior
- configuración por variables de entorno

Quiero una arquitectura pequeña, no “enterprise”.

FASE 7. OAuth 2
Implementa y explica la autenticación OAuth 2 de la forma más simple y realista posible.
Debe ser fácil de demostrar.
Si Supabase Auth con proveedor OAuth 2 es la opción más simple, úsala.

FASE 8. RBAC y ABAC
Implementa el sistema mínimo necesario para demostrar ambos:
- RBAC claro
- ABAC claro
- enforcement en servidor
- protección frente a IDOR
- aislamiento multi-tenant

No quiero teoría larga. Quiero diseño práctico y código real.

FASE 9. Dockerización
Esto es muy importante.

Quiero que prepares:
- Dockerfile de la app
- docker-compose.yml
- servicios necesarios
- scripts de arranque
- documentación para levantar todo rápido

Si SonarQube, ZAP o Dependency-Check van mejor como ejecución puntual en contenedores en lugar de estar siempre levantados, organízalo así.
Lo importante es que todo sea fácilmente replicable con Docker.

FASE 10. Seguridad obligatoria del proyecto
Prepara lo mínimo viable para cumplir:
1. SonarQube
2. OWASP Dependency-Check
3. OWASP ZAP
4. gestión de secretos

Para cada uno quiero:
- cómo se integra en este proyecto pequeño
- qué comando usar
- qué evidencia genera
- dónde dejar la configuración o scripts

Quiero scripts Docker o scripts de shell si ayudan.

FASE 11. Gestión de secretos
Quiero una estrategia simple y correcta:
- variables de entorno
- archivo .env.example
- nada hardcodeado
- explicación de qué secretos van en local y cuáles en producción
- cómo configurarlo en Render y Supabase
- enfoque mínimo pero profesional

FASE 12. Estructura mínima del repositorio
Quiero una estructura pequeña y limpia.
No demasiadas carpetas.
Solo las que realmente aporten valor.

FASE 13. Implementación inicial real
Genera código real para una primera versión funcional del proyecto.
Debe incluir como mínimo:
- login OAuth 2
- rutas protegidas
- listado de tickets
- creación de tickets
- detalle de tickets
- enforcement de tenant isolation
- enforcement de RBAC
- ejemplos de ABAC
- configuración Docker
- configuración básica para SonarQube
- configuración o script para Dependency-Check
- configuración o script para ZAP
- README inicial

Si alguna parte no puede quedar completamente cerrada, deja stubs claros y documentados.

FASE 14. Documentación
Genera:
- README claro y corto
- instrucciones para levantar el proyecto con Docker
- instrucciones para configurar Supabase
- instrucciones para desplegar en Render
- instrucciones para ejecutar SonarQube
- instrucciones para ejecutar Dependency-Check
- instrucciones para ejecutar ZAP
- explicación breve de OAuth 2, RBAC y ABAC en este proyecto

FASE 15. Orden de trabajo
Trabaja así:
1. Elegir stack mínimo
2. definir MVP
3. diseñar datos y roles
4. diseñar arquitectura
5. generar estructura de proyecto
6. implementar código base
7. dockerizar
8. preparar herramientas de seguridad
9. documentar
10. indicar qué queda funcional y qué queda pendiente

Restricciones finales:
- no hagas una app grande
- no metas características extra
- no hagas módulos innecesarios
- no compliques la autorización más de la cuenta
- no uses demasiadas librerías
- no generes código ornamental
- todo debe estar orientado a cumplir requisitos con el menor alcance posible
- el proyecto debe poder retomarse en el futuro sin rehacer la base

Resultado esperado:
Quiero un prototipo mínimo, serio, funcional, dockerizado y fácil de replicar, que cumpla los requisitos de la asignatura y que se pueda enseñar sin problemas en una defensa.

Empieza ya y entrega código real.