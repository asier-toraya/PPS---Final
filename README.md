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
- `support_agent`: ve tickets de su tenant y edita solo tickets asignados a el.
- `client_user`: crea tickets y consulta tickets permitidos de su tenant.

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
