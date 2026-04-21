# Resumen del proyecto

## Requisitos cumplidos

- OAuth 2: implementado con Supabase Auth y GitHub.
- RBAC: roles `super_admin`, `tenant_admin`, `support_agent` y `client_user`.
- ABAC: decisiones por `tenant_id`, `assigned_to`, `created_by` y `status`.
- Aislamiento multi-tenant: aplicado en servidor y reforzado con RLS en Supabase.
- Prevención de IDOR: control en aplicación y en base de datos.
- Gestión de secretos: variables de entorno, sin secretos en el código.
- Docker: app y herramientas preparadas con `Dockerfile` y `docker-compose.yml`.
- SAST: proyecto preparado para SonarQube.
- SCA: proyecto preparado para OWASP Dependency-Check.
- DAST: proyecto preparado para OWASP ZAP.
- Despliegue: proyecto preparado para Render + Supabase.

## Funcionamiento técnico

- La aplicación está hecha con Next.js y TypeScript.
- Supabase se usa para autenticación, base de datos PostgreSQL y políticas RLS.
- La app tiene pocas pantallas: login, listado de tickets, creación de ticket, detalle de ticket y panel admin.
- La lógica sensible se ejecuta en servidor con Server Components y Server Actions.

## Cómo funciona el login

- El usuario pulsa `Entrar con OAuth 2` en `/login`.
- La acción `signInWithOAuth` envía al usuario al proveedor OAuth configurado, por ejemplo GitHub.
- GitHub autentica al usuario y devuelve el control a Supabase.
- Supabase redirige a `/auth/callback` de la aplicación.
- En ese callback la app intercambia el `code` por una sesión con `exchangeCodeForSession`.
- Si el usuario tiene membership, entra a `/tickets`. Si no la tiene, vuelve a `/login?missingMembership=1`.

## Dónde se guardan la sesión y los tokens

- La sesión de Supabase se mantiene mediante cookies gestionadas en servidor.
- La app usa `@supabase/ssr` y `cookies()` de Next.js para leer y escribir la sesión.
- Los tokens no se guardan manualmente en código ni en localStorage.
- Las claves de configuración van en variables de entorno, por ejemplo `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`.

## Medidas de seguridad

- Autenticación OAuth 2 con proveedor externo.
- Autorización en servidor mediante RBAC y ABAC.
- Aislamiento multi-tenant con `tenant_id`.
- RLS en Supabase para reforzar el control de acceso en base de datos.
- Prevención de IDOR mediante comprobaciones de tenant y ownership.
- Validación básica de entradas en servidor y restricciones SQL en la base de datos.
- Cabeceras seguras en Next.js: `X-Content-Type-Options`, `X-Frame-Options` y `Referrer-Policy`.
- Secretos fuera del repositorio y gestionados por variables de entorno.

## Qué falta

- Probar el flujo completo con varios usuarios y varios roles.
- Demostrar el aislamiento entre dos tenants distintos.
- Ejecutar SonarQube y guardar evidencias.
- Ejecutar Dependency-Check y guardar evidencias.
- Ejecutar ZAP y guardar evidencias.
- Desplegar en Render y verificar el login OAuth en producción.
- Dejar capturas y resultados listos para la defensa.


Necesito poder asignar a los usuarios a ciertos tickets antes del punto de entrada del controlador con la idea de que solo ciertos usuarios puedan ver ciertos tickets, ABAC y RBAC. 