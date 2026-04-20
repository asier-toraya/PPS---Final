Actúa como un senior full-stack engineer especializado en secure web development, multi-tenant SaaS architecture y secure deployment.

Quiero que diseñes e implementes la base de una aplicación web profesional para mi proyecto final de la asignatura “Puesta en Producción Segura”.

El proyecto debe ser un prototipo funcional, realista, bien estructurado, fácil de defender ante un profesor de ciberseguridad y preparado para retomarlo en el futuro sin tener que rehacer la arquitectura.

Dominio del proyecto:
Construye una plataforma SaaS multi-tenant de soporte IT / service desk para pymes.

Descripción funcional:
Cada empresa cliente (tenant) podrá usar la plataforma para registrar incidencias, hacer seguimiento, gestionar usuarios de su organización y acceder a soporte según su plan. Habrá usuarios internos de soporte con distintos niveles de privilegio. La aplicación debe reflejar de forma clara autenticación segura, control de acceso granular, aislamiento multi-tenant y buenas prácticas de puesta en producción segura.

Condiciones obligatorias del proyecto:
- Autenticación OAuth 2
- Gestión de autorización RBAC y ABAC
- Uso de herramientas de SAST con SonarQube
- Análisis de dependencias con OWASP Dependency-Check
- Análisis DAST con OWASP ZAP
- Despliegue de la aplicación web usando Render.com y Supabase
- Uso de herramientas de gestión de secretos

Objetivo principal:
Quiero un MVP serio, funcional y bien diseñado. No quiero una demo superficial. Quiero una base sólida, limpia y profesional que funcione bien y que sea fácilmente ampliable en el futuro.

Prioridades:
- Seguridad por diseño
- Simplicidad razonable
- Código limpio y mantenible
- Arquitectura fácil de explicar
- Enfoque realista de producto SaaS B2B
- Alcance moderado pero bien implementado
- Preparado para análisis de seguridad y despliegue real

Quiero que tomes decisiones técnicas pensando en:
- facilidad de desarrollo
- facilidad de despliegue
- compatibilidad con Render y Supabase
- claridad para explicar OAuth 2, RBAC, ABAC y multi-tenancy
- facilidad para ejecutar SonarQube, Dependency-Check y ZAP
- facilidad para documentar el proyecto en la memoria final

Stack preferido:
Puedes elegir el stack más adecuado, pero prioriza una opción moderna, sencilla y realista. Si es apropiado, puedes usar por ejemplo:
- Next.js para frontend y backend web
- TypeScript
- Supabase para base de datos y autenticación si encaja con OAuth 2
- Render para despliegue
- Tailwind para UI si simplifica
- políticas y middleware para enforcement de autorización

Aun así, elige tú el stack final y justifícalo brevemente.

Necesito que me entregues el trabajo en fases, con salida clara y profesional.

FASE 1. Definición del producto
Quiero que definas:
- nombre profesional del producto
- resumen ejecutivo
- problema que resuelve
- público objetivo
- propuesta de valor
- por qué este dominio es adecuado para demostrar seguridad moderna

FASE 2. Alcance del MVP
Quiero que propongas un MVP realista, no demasiado grande, pero suficientemente completo.

Debe incluir como mínimo:
- autenticación
- gestión de tenants/organizaciones
- gestión de usuarios
- gestión de roles
- tickets/incidencias
- comentarios o seguimiento de tickets
- panel de administración básico
- logs de auditoría básicos
- diferenciación de acceso por plan o estado, para demostrar ABAC

Indica también:
- qué entra en el MVP
- qué se deja fuera para futuras versiones
- cómo dejar preparado el proyecto para crecer en el futuro

FASE 3. Roles y autorización
Quiero un diseño claro de RBAC y ABAC.

Define roles como mínimo:
- super_admin
- tenant_admin
- support_agent
- senior_support_agent
- client_user

Para RBAC quiero:
- tabla clara de permisos por rol
- qué puede hacer cada rol
- qué recursos puede ver, crear, editar o administrar

Para ABAC quiero ejemplos reales y útiles, por ejemplo:
- un usuario solo puede acceder a recursos de su tenant
- un support_agent solo puede editar tickets asignados a él
- un senior_support_agent puede ver tickets críticos del tenant o del ámbito asignado
- tenant_admin puede gestionar usuarios de su tenant, pero no de otros
- ciertas funciones solo están disponibles si el tenant tiene plan premium
- ciertos tickets solo pueden cerrarse si están en estado correcto
- acceso condicionado por ownership, status, priority, tenant_id y subscription_plan

Quiero que el sistema de autorización esté pensado para evitar IDOR y fugas entre tenants.

FASE 4. Multi-tenancy
Quiero que diseñes el aislamiento multi-tenant de forma clara y defendible.

Explica:
- qué estrategia usarás para multi-tenancy
- cómo se separan los datos por tenant
- cómo se evita acceso cruzado
- qué comprobaciones deben existir en frontend, backend y base de datos
- qué decisiones tomarás para que el aislamiento sea fácil de explicar en la defensa

Quiero un enfoque realista para un proyecto académico, evitando complejidad innecesaria.

FASE 5. Modelo de datos
Diseña el modelo de datos principal.

Incluye al menos estas entidades:
- tenants
- users
- memberships
- roles
- permissions si hacen falta
- tickets
- ticket_comments
- audit_logs
- subscription_plans o equivalente
- cualquier otra entidad mínima necesaria

Quiero:
- explicación conceptual
- tablas principales
- campos importantes
- relaciones
- claves foráneas
- campos de seguridad o trazabilidad útiles
- cómo se representa tenant_id en los recursos
- cómo se soportan RBAC y ABAC en el modelo

FASE 6. Arquitectura técnica
Diseña la arquitectura concreta del sistema.

Quiero que indiques:
- frontend
- backend
- base de datos
- autenticación OAuth 2
- sistema de autorización
- gestión de secretos
- despliegue en Render
- uso de Supabase
- estructura de servicios y capas

Quiero una arquitectura sencilla, limpia y mantenible.

FASE 7. Autenticación OAuth 2
La autenticación OAuth 2 es obligatoria.

Quiero que implementes y expliques claramente:
- cómo se integra OAuth 2
- qué proveedor usarás
- cómo encaja con Supabase si lo consideras adecuado
- flujo de login
- manejo de sesión
- protección de rutas
- renovación o validación de sesión si aplica
- buenas prácticas de seguridad relacionadas

Muy importante:
La implementación debe ser realista y fácil de demostrar en el proyecto final.

FASE 8. Seguridad por diseño
Quiero que incorpores medidas de seguridad desde el inicio.

Incluye al menos:
- validación estricta de inputs
- sanitización cuando proceda
- control de acceso en servidor
- prevención de IDOR
- aislamiento multi-tenant
- principio de mínimo privilegio
- logs de auditoría
- manejo seguro de errores
- secretos fuera del código
- variables de entorno
- protección de endpoints
- políticas seguras por defecto
- cabeceras seguras si aplican
- protección básica frente a abuso o rate limiting si es viable
- protección frente a exposición accidental de datos sensibles

Indica también qué amenazas principales estás mitigando.

FASE 9. Requisitos de seguridad del proyecto
Quiero que el repositorio quede preparado para demostrar claramente estas herramientas obligatorias:

1. SonarQube
- cómo integrarlo en el proyecto
- qué analizará
- qué tipos de issues podrá detectar
- qué archivos de configuración conviene incluir
- cómo ejecutarlo en local o preentrega

2. OWASP Dependency-Check
- cómo ejecutarlo
- qué dependencias analizará
- qué evidencia generará
- cómo documentar hallazgos y mitigaciones

3. OWASP ZAP
- cómo usarlo contra la app desplegada o en local
- qué flujos conviene probar
- qué endpoints o pantallas analizar
- cómo obtener evidencias para la memoria

Quiero que prepares scripts, documentación y estructura para que estas herramientas puedan usarse de verdad.

FASE 10. Gestión de secretos
Esta condición es obligatoria.

Quiero que definas e implementes una estrategia razonable de gestión de secretos para este proyecto.

Debe incluir:
- uso de variables de entorno
- separación de secretos por entorno
- ningún secreto hardcodeado
- documentación clara de qué secretos existen
- ejemplo de archivo .env.example
- recomendación de uso en local y en producción
- cómo usar los secretos en Render y Supabase
- qué herramienta o enfoque de secret management usarás para un proyecto de este tipo

Quiero una solución realista y defendible, no algo teórico.

FASE 11. Estructura del repositorio
Genera una estructura de carpetas profesional y mantenible.

Quiero algo coherente, por ejemplo:
- src
- app
- components
- features
- lib
- services
- repositories
- middleware
- policies
- types
- config
- docs
- scripts
- security
- tests

Adáptalo a la arquitectura elegida.

FASE 12. Implementación inicial
Genera una primera versión funcional del proyecto con código real.

Quiero como mínimo:
- página de login con OAuth 2
- flujo funcional de autenticación
- gestión básica de tenants
- usuarios de ejemplo o seed
- roles definidos
- tickets con CRUD básico o casi completo
- comentarios de tickets
- enforcement de RBAC
- ejemplos visibles de ABAC
- protección de rutas
- auditoría básica
- estructura lista para ampliaciones futuras

Si alguna parte no puede quedar totalmente cerrada, deja stubs bien diseñados y documentados.

FASE 13. Calidad del código
Quiero que el código sea:
- TypeScript cuando sea posible
- modular
- legible
- bien nombrado
- comentado solo donde tenga sentido
- sin sobreingeniería
- con separación clara de responsabilidades
- fácil de testear y mantener

FASE 14. Documentación
Genera también:
- README profesional
- explicación de la arquitectura
- explicación del modelo OAuth 2
- explicación del RBAC
- explicación del ABAC
- explicación del aislamiento multi-tenant
- guía de ejecución local
- guía de despliegue en Render
- guía de configuración de Supabase
- guía de uso de SonarQube
- guía de uso de OWASP Dependency-Check
- guía de uso de OWASP ZAP
- guía de gestión de secretos
- roadmap de futuras mejoras

FASE 15. Entrega final de la respuesta
Quiero que trabajes en este orden:
1. Elegir stack y justificarlo brevemente
2. Definir el producto y el MVP
3. Diseñar arquitectura
4. Diseñar modelo de datos
5. Diseñar RBAC y ABAC
6. Diseñar la estrategia multi-tenant
7. Generar estructura de proyecto
8. Implementar la base del código
9. Añadir scripts/configuración de seguridad
10. Añadir documentación inicial
11. Indicar qué está funcional y qué queda pendiente

Restricciones importantes:
- No hagas una app gigante
- No inventes módulos innecesarios
- No metas complejidad enterprise absurda
- No sacrifiques seguridad por velocidad
- No sacrifiques claridad por “modernidad”
- Prioriza un prototipo pequeño pero robusto
- Todo debe quedar coherente con Render, Supabase, OAuth 2, RBAC, ABAC, SonarQube, Dependency-Check, ZAP y gestión de secretos

Resultado esperado:
Quiero que el resultado parezca un MVP serio de SaaS B2B, con una base sólida de puesta en producción segura, no una simple práctica escolar.

Empieza ya y entrega código real, estructura real y documentación inicial.