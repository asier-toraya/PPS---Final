# TenantDesk Min

MVP academico minimo de soporte IT multi-tenant para Puesta en Produccion Segura.

La app demuestra OAuth 2 con Supabase Auth, RBAC, ABAC, aislamiento por tenant, Docker, Render, Supabase, SonarQube, OWASP Dependency-Check, OWASP ZAP y gestion de secretos sin construir un SaaS grande.

## FASE 1. Propuesta minima

**Nombre:** TenantDesk Min.

**Resumen:** Aplicacion web pequena de service desk. Un usuario entra con OAuth 2, pertenece a un tenant mediante una membership y trabaja con tickets. El objetivo no es tener muchas features, sino demostrar controles de seguridad obligatorios de forma clara.

**Alcance MVP:**
- Login OAuth 2.
- Listado, creacion y detalle de tickets.
- Admin minimo para crear memberships.
- Roles: `super_admin`, `tenant_admin`, `support_agent`, `client_user`.
- Reglas RBAC/ABAC en servidor y RLS en Supabase.

**Por que cumple:** cubre autenticacion, autorizacion, multi-tenant, despliegue Docker, Supabase/Render y evidencias SAST/SCA/DAST con el menor numero de pantallas y tablas.

## FASE 2. Stack elegido

- Next.js + TypeScript: frontend y backend en una sola app.
- Supabase Auth + Postgres: OAuth 2, base de datos y RLS.
- CSS simple: no Tailwind para evitar dependencia extra.
- Docker Compose: app y herramientas de seguridad reproducibles.
- Render: despliegue web Docker con variables de entorno.

La decision minimiza piezas: una app, una base gestionada y contenedores para analisis.

## FASE 3. Modelo funcional minimo

Usuarios entran por OAuth 2 y se enlazan a tenants mediante `memberships`.

Acciones por rol:
- `super_admin`: ve tickets y memberships de todos los tenants.
- `tenant_admin`: gestiona memberships y tickets de su tenant.
- `support_agent`: ve y edita solo tickets asignados a el.
- `client_user`: crea tickets y solo consulta los tickets creados por el.

RBAC: el rol decide si puede administrar, crear o editar.

ABAC: las decisiones usan atributos como `tenant_id`, `assigned_to`, `created_by` y `status`.

## FASE 4. Multi-tenant minimo

Cada tabla operativa incluye `tenant_id`. La app inserta tickets siempre con el `tenant_id` de la membership activa. Las consultas pasan por Supabase con la sesion del usuario, por lo que aplican RLS.

Defensas:
- Servidor: funciones en `lib/authz.ts` validan rol y atributos antes de mutar.
- Base de datos: `supabase/schema.sql` activa RLS y bloquea acceso cruzado por tenant.
- IDOR: aunque alguien cambie `/tickets/:id`, RLS evita leer tickets fuera de su tenant.

## FASE 5. Datos minimos

Tablas:
- `tenants`: `id`, `name`, `plan`, `created_at`.
- `memberships`: `id`, `tenant_id`, `user_id`, `role`, `created_at`.
- `tickets`: `id`, `tenant_id`, `title`, `description`, `status`, `created_by`, `assigned_to`, `created_at`, `updated_at`.

No se incluye `ticket_comments` ni `audit_logs` para mantener el prototipo pequeno. La trazabilidad minima queda en fechas y responsables.

## FASE 6. Arquitectura minima

```text
Next.js app
  app/            rutas y pantallas
  lib/            Supabase, acciones servidor, autorizacion
  components/     navegacion minima
Supabase
  Auth OAuth 2
  Postgres + RLS
Docker
  app
  SonarQube bajo profile security
  Dependency-Check bajo profile security
  ZAP bajo profile security
```

## FASE 7. OAuth 2

Supabase Auth gestiona OAuth 2. Configura un proveedor como GitHub o Google en Supabase y pon:

```env
NEXT_PUBLIC_OAUTH_PROVIDER=github
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

URL de callback local:

```text
http://localhost:3000/auth/callback
```

En produccion cambia `NEXT_PUBLIC_SITE_URL` a la URL de Render y anade su callback en Supabase.

## FASE 8. RBAC y ABAC

Codigo principal:
- `lib/authz.ts`: reglas de autorizacion.
- `lib/actions.ts`: server actions que aplican controles antes de escribir.
- `supabase/schema.sql`: RLS como segunda capa.

Ejemplos:
- `tenant_id` evita acceso cruzado.
- `support_agent` solo ve tickets asignados a su `user.id`.
- `client_user` solo ve tickets creados por su `user.id`.
- `support_agent` edita solo si `ticket.assigned_to === user.id`.
- `support_agent` no puede reabrir tickets cerrados; eso queda para `tenant_admin` o `super_admin`.
- `tenant_admin` administra solo su tenant.

## FASE 9. Docker

Crear `.env` desde `.env.example` y levantar:

```powershell
Copy-Item .env.example .env
docker compose up --build
```

La app queda en:

```text
http://localhost:3000
```

## FASE 10. Seguridad obligatoria

## Cumplimiento resumido de requisitos de seguridad

- OAuth 2: login delegado en Supabase Auth con proveedor OAuth externo como GitHub. Flujo en `app/login/page.tsx`, `lib/actions.ts` y `app/auth/callback/route.ts`.
- RBAC: permisos por rol `super_admin`, `tenant_admin`, `support_agent` y `client_user`. Reglas en `lib/authz.ts`.
- ABAC: decisiones por atributos como `tenant_id`, `assigned_to`, `created_by` y `status`. Enforcement en `lib/authz.ts` y `lib/actions.ts`.
- Aislamiento multi-tenant: todos los recursos operativos usan `tenant_id` y las consultas quedan limitadas por membership y RLS. Politicas en `supabase/schema.sql`.
- Prevencion de IDOR: doble capa de control en servidor y base de datos. Aunque un usuario manipule rutas o IDs, RLS bloquea acceso fuera de su tenant.
- RLS en base de datos: politicas activas sobre `tenants`, `memberships` y `tickets` en `supabase/schema.sql`.
- Validacion y restricciones: validaciones basicas en servidor y `check constraints` en base de datos para roles, estados y longitudes.
- Cabeceras de seguridad: `X-Content-Type-Options`, `X-Frame-Options` y `Referrer-Policy` configuradas en `next.config.mjs`.
- Gestion de secretos: variables de entorno, `.env` o `.env.local` fuera del repositorio y configuracion equivalente en Render. `.gitignore` evita versionar secretos.
- SAST: SonarQube preparado con `sonar-project.properties` y servicio en `docker-compose.yml`.
- SCA: OWASP Dependency-Check preparado con `scripts/run-dependency-check.ps1`.
- DAST: OWASP ZAP preparado con `scripts/run-zap.ps1`.
- Despliegue seguro: app desplegable en Render con Supabase para autenticacion y base de datos, manteniendo configuracion sensible fuera del codigo.

### SonarQube

Levantar SonarQube:

```powershell
docker compose --profile security up -d sonarqube
```

Entrar en `http://localhost:9000`, crear token y ejecutar scanner desde tu entorno o CI. La configuracion esta en `sonar-project.properties`.

Evidencia: informe del proyecto en SonarQube.

### OWASP Dependency-Check

```powershell
.\scripts\run-dependency-check.ps1
```

Evidencia:

```text
reports/dependency-check/dependency-check-report.html
reports/dependency-check/dependency-check-report.json
```

### OWASP ZAP

Con la app levantada:

```powershell
.\scripts\run-zap.ps1
```

Evidencia:

```text
reports/zap/zap-baseline.html
reports/zap/zap-baseline.json
```

## FASE 11. Secretos

Estrategia:
- `.env.example` documenta variables sin secretos reales.
- `.env` local no se versiona.
- Render almacena variables en Environment.
- Supabase guarda claves OAuth del proveedor.
- No hay secretos hardcodeados.

Variables:
- `NEXT_PUBLIC_SITE_URL`: URL local o Render.
- `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon key de Supabase.
- `NEXT_PUBLIC_OAUTH_PROVIDER`: `github`, `google` o `azure`.
- `SUPABASE_SERVICE_ROLE_KEY`: clave privada de backend para funciones administrativas como buscar usuarios de `auth.users` desde `/admin`.

## FASE 12. Estructura

```text
app/                    rutas Next.js
components/             componentes compartidos minimos
lib/                    Supabase, authz, server actions
scripts/                comandos Docker de seguridad
supabase/schema.sql     tablas y politicas RLS
Dockerfile
docker-compose.yml
sonar-project.properties
.env.example
```

## FASE 13. Implementacion inicial

Incluido en este repo:
- Login OAuth 2.
- Rutas protegidas.
- Tickets: listado, creacion y detalle.
- Admin minimo de memberships.
- Enforcement RBAC/ABAC en servidor.
- RLS SQL para multi-tenant.
- Dockerfile y Docker Compose.
- Scripts para Dependency-Check y ZAP.
- Configuracion SonarQube.

## FASE 14. Configuracion Supabase

1. Crear proyecto en Supabase.
2. Ejecutar `supabase/schema.sql` en SQL Editor.
3. Activar proveedor OAuth 2 en Authentication > Providers.
4. Anadir callback local y de Render.
5. Entrar una vez en la app para crear el usuario OAuth.
6. Crear un tenant y membership inicial en SQL Editor:

```sql
insert into public.tenants (name) values ('Tenant Demo') returning id;

insert into public.memberships (tenant_id, user_id, role)
values ('TENANT_UUID', 'AUTH_USER_UUID', 'tenant_admin');
```

## FASE 15. Despliegue Render

1. Crear Web Service desde el repositorio.
2. Elegir Docker.
3. Configurar variables de entorno de `.env.example`.
4. Usar la URL de Render como `NEXT_PUBLIC_SITE_URL`.
5. Anadir `https://tu-servicio.onrender.com/auth/callback` en Supabase Auth.
6. Desplegar.

## Estado funcional

Funcional:
- App minima Next.js.
- OAuth 2 via Supabase.
- Multi-tenant por `tenant_id`.
- RBAC/ABAC basico.
- Docker local.
- Preparacion SAST/SCA/DAST.

Pendiente razonable:
- Crear datos iniciales reales en Supabase.
- Ejecutar analisis y guardar evidencias.
- Ajustar proveedor OAuth concreto de la defensa.

## Seguridad del proyecto

### OAuth 2 y autenticacion

La autenticacion se implementa con Supabase Auth y un proveedor OAuth externo, normalmente GitHub.

Archivos principales:
- `app/login/page.tsx`
- `lib/actions.ts`
- `app/auth/callback/route.ts`
- `lib/supabase.ts`

Funcionamiento:
- El usuario pulsa `Entrar con OAuth 2` en `/login`.
- La accion `signInWithOAuth` redirige al proveedor OAuth configurado.
- Tras autenticarse, Supabase devuelve el control a `/auth/callback`.
- En `app/auth/callback/route.ts` se intercambia el `code` por la sesion con `exchangeCodeForSession`.
- Si el usuario ya tiene membership, entra en `/tickets`. Si no la tiene, vuelve a `/login?missingMembership=1`.

Esto evita gestionar contrasenas propias en la aplicacion y delega la autenticacion a un proveedor externo.

### Sesion y tokens

La sesion se gestiona con cookies de Supabase en servidor.

Archivos principales:
- `lib/supabase.ts`
- `app/auth/callback/route.ts`

Funcionamiento:
- La app usa `@supabase/ssr` y `cookies()` de Next.js para leer y escribir la sesion.
- Los tokens no se guardan manualmente en el codigo ni en `localStorage`.
- La sesion se reutiliza en Server Components y Server Actions para consultar Supabase con la identidad del usuario autenticado.

### Autorizacion RBAC

El proyecto define cuatro roles:
- `super_admin`
- `tenant_admin`
- `support_agent`
- `client_user`

Archivos principales:
- `lib/types.ts`
- `lib/authz.ts`
- `app/admin/page.tsx`

Funcionamiento:
- `super_admin` tiene visibilidad global.
- `tenant_admin` administra memberships y tickets de su tenant.
- `support_agent` trabaja solo sobre tickets asignados a el.
- `client_user` crea tickets y consulta solo los que le corresponden.

La aplicacion no se limita a ocultar botones: las decisiones de permisos se comprueban en servidor.

### Autorizacion ABAC

Ademas del rol, se usan atributos del recurso y del contexto para decidir acceso.

Archivos principales:
- `lib/authz.ts`
- `lib/actions.ts`
- `supabase/schema.sql`

Atributos usados:
- `tenant_id`
- `assigned_to`
- `created_by`
- `status`

Ejemplos:
- un `support_agent` solo puede ver y editar tickets asignados a su `user.id`
- un `client_user` solo puede ver tickets creados por su `user.id`
- un ticket cerrado no puede reabrirse por cualquier rol

### Aislamiento multi-tenant

El proyecto usa aislamiento por fila con `tenant_id`.

Archivos principales:
- `supabase/schema.sql`
- `lib/authz.ts`
- `app/tickets/page.tsx`
- `app/tickets/[id]/page.tsx`

Funcionamiento:
- `memberships` enlaza usuario, tenant y rol.
- `tickets` guarda `tenant_id` en cada fila.
- La app inserta tickets con el `tenant_id` de la membership activa.
- Las consultas se hacen con la sesion real del usuario.
- Supabase aplica RLS y solo devuelve filas permitidas.

Esto evita acceso cruzado entre tenants y refuerza la prevencion de IDOR.

### RLS y enforcement en base de datos

La seguridad importante no depende solo de la interfaz o del backend de Next.js. Tambien se aplica en PostgreSQL mediante Row Level Security.

Archivo principal:
- `supabase/schema.sql`

Funcionamiento:
- Hay politicas RLS sobre `tenants`, `memberships` y `tickets`.
- La policy `tickets_select` limita la visibilidad segun rol y atributos.
- `tenant_admin` ve todos los tickets de su tenant.
- `support_agent` ve solo tickets asignados a el.
- `client_user` ve solo tickets creados por el.
- `super_admin` ve todo.

Aunque un usuario cambie una URL o intente consultar un `id` ajeno, la base de datos no devuelve la fila si no cumple la policy.

### Validacion y controles en servidor

La aplicacion valida datos y aplica controles antes de escribir en la base.

Archivos principales:
- `lib/actions.ts`
- `lib/authz.ts`

Funcionamiento:
- `requireMembership()` exige sesion y membership antes de usar la app.
- `createTicket()` valida titulo y descripcion.
- `createMembership()` comprueba que solo perfiles autorizados creen memberships.
- `assertAllowedStatusChange()` bloquea cambios de estado no permitidos.

Esto evita confiar solo en el cliente o en el HTML del formulario.

### Restricciones en la base de datos

El esquema SQL incluye restricciones estructurales para reducir errores y datos invalidos.

Archivo principal:
- `supabase/schema.sql`

Ejemplos:
- `check` para roles validos
- `check` para estados validos
- limites de longitud para `title` y `description`
- claves foraneas para `tenant_id`, `user_id`, `created_by` y `assigned_to`
- `unique (tenant_id, user_id)` en memberships

### Cabeceras de seguridad

La app aplica cabeceras HTTP basicas de endurecimiento.

Archivo principal:
- `next.config.mjs`

Cabeceras configuradas:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`

Estas medidas reducen riesgos de interpretacion incorrecta de contenido, clickjacking y fuga innecesaria de referer.

### Gestion de secretos

Los secretos no se guardan en el codigo.

Archivos principales:
- `.env.example`
- `.gitignore`
- `docker-compose.yml`
- `README.md`

Variables usadas:
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_OAUTH_PROVIDER`
- `SUPABASE_SERVICE_ROLE_KEY`

Funcionamiento:
- `.env` y `.env.local` no se versionan.
- Render almacena secretos en `Environment`.
- Supabase almacena la configuracion del proveedor OAuth.
- `SUPABASE_SERVICE_ROLE_KEY` solo se usa en servidor para funciones administrativas como buscar usuarios desde `/admin`.

### SAST, SCA y DAST

El proyecto queda preparado para analisis de seguridad obligatorios.

#### SonarQube

Archivos principales:
- `sonar-project.properties`
- `docker-compose.yml`

Funcionamiento:
- analiza codigo fuente de `app`, `components` y `lib`
- ayuda a detectar bugs, code smells y patrones inseguros

#### OWASP Dependency-Check

Archivos principales:
- `scripts/run-dependency-check.ps1`
- `docker-compose.yml`

Funcionamiento:
- analiza dependencias del proyecto
- genera informes HTML y JSON en `reports/dependency-check`

#### OWASP ZAP

Archivos principales:
- `scripts/run-zap.ps1`
- `docker-compose.yml`

Funcionamiento:
- lanza un analisis baseline contra la app en ejecucion
- genera informes HTML y JSON en `reports/zap`

### Resumen de seguridad

La seguridad del proyecto se basa en varias capas:
- autenticacion externa con OAuth 2
- sesion gestionada en servidor
- autorizacion RBAC y ABAC
- aislamiento multi-tenant por `tenant_id`
- RLS en base de datos
- validacion en servidor y restricciones SQL
- secretos fuera del codigo
- cabeceras seguras
- preparacion real para SAST, SCA y DAST
