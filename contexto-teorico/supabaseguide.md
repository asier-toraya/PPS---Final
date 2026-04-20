# Guia Supabase para TenantDesk Min

Esta guia explica lo minimo necesario para que el proyecto funcione con Supabase: base de datos, RLS, OAuth 2 y usuario administrador inicial.

## 1. Crear proyecto en Supabase

1. Entra en Supabase.
2. Crea un proyecto nuevo.
3. Guarda estos datos:
   - Project URL.
   - anon public key.
4. Copia `.env.example` a `.env` en el proyecto local.
5. Rellena:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
NEXT_PUBLIC_OAUTH_PROVIDER=github
```

Para Render, `NEXT_PUBLIC_SITE_URL` debe ser la URL publica de Render.

## 2. Aplicar esquema SQL

En Supabase:

1. Ve a `SQL Editor`.
2. Crea una query nueva.
3. Copia todo el contenido de:

```text
supabase/schema.sql
```

4. Ejecuta la query.

Esto crea:

- `tenants`
- `memberships`
- `tickets`
- funciones auxiliares de autorizacion
- politicas RLS
- permisos para usuarios autenticados

## 3. Comprobar que RLS esta activo

En `Table Editor`, revisa estas tablas:

- `tenants`
- `memberships`
- `tickets`

Cada una debe tener RLS activo. Si has ejecutado `supabase/schema.sql`, ya queda activado automaticamente.

## 4. Configurar OAuth 2

La opcion mas sencilla para la defensa es GitHub.

En Supabase:

1. Ve a `Authentication`.
2. Entra en `Providers`.
3. Activa `GitHub`.
4. Configura el `Client ID` y `Client Secret` de GitHub.

En GitHub:

1. Ve a `Settings`.
2. Entra en `Developer settings`.
3. Entra en `OAuth Apps`.
4. Crea una nueva OAuth App.

Valores para local:

```text
Application name: TenantDesk Min
Homepage URL: http://localhost:3000
Authorization callback URL: https://qwuxnlslwsifemhkhjda.supabase.co/auth/v1/callback
```

Importante: GitHub apunta al callback de Supabase, no directamente al callback de Next.js.

## 5. Configurar URLs permitidas en Supabase Auth

En Supabase:

1. Ve a `Authentication`.
2. Entra en `URL Configuration`.
3. Configura:

```text
Site URL:
http://localhost:3000
```

4. En `Redirect URLs`, anade:

```text
http://localhost:3000/auth/callback
```

Si vas a usar Render, anade tambien:

```text
https://TU-SERVICIO.onrender.com/auth/callback
```

Y cambia el `Site URL` de produccion a:

```text
https://TU-SERVICIO.onrender.com
```

## 6. Entrar por primera vez en la app

1. Levanta la app:

```powershell
docker compose up --build
```

2. Abre:

```text
http://localhost:3000
```

3. Pulsa `Entrar con OAuth 2`.
4. Completa login con GitHub.

Es normal que despues del primer login aparezca un mensaje indicando que falta membership. El usuario ya existe en `auth.users`, pero todavia no pertenece a ningun tenant.

## 7. Obtener el user_id del primer usuario

En Supabase, abre `SQL Editor` y ejecuta:

```sql
select
  id,
  email,
  created_at
from auth.users
order by created_at desc;
```

Copia el `id` del usuario con el que acabas de iniciar sesion.

## 8. Crear tenant inicial

Ejecuta:

```sql
insert into public.tenants (name, plan)
values ('Tenant Demo', 'basic')
returning id, name, plan;
```

Copia el `id` devuelto. Sera el `tenant_id`.

## 9. Crear membership inicial tenant_admin

Sustituye:

- `TENANT_UUID` por el `id` del tenant.
- `AUTH_USER_UUID` por el `id` de `auth.users`.

```sql
insert into public.memberships (tenant_id, user_id, role)
values (
  'TENANT_UUID',
  'AUTH_USER_UUID',
  'tenant_admin'
);
```

Con esto, tu usuario ya puede entrar a la app y usar el panel admin minimo.

## 10. Crear usuarios de prueba

Para probar RBAC/ABAC, inicia sesion con otros usuarios OAuth y luego asignales roles.

Ver usuarios:

```sql
select
  id,
  email,
  created_at
from auth.users
order by created_at desc;
```

Crear agente de soporte:

```sql
insert into public.memberships (tenant_id, user_id, role)
values (
  'TENANT_UUID',
  'AGENT_USER_UUID',
  'support_agent'
);
```

Crear cliente:

```sql
insert into public.memberships (tenant_id, user_id, role)
values (
  'TENANT_UUID',
  'CLIENT_USER_UUID',
  'client_user'
);
```

Crear otro tenant para demostrar aislamiento:

```sql
insert into public.tenants (name, plan)
values ('Tenant Aislado', 'basic')
returning id, name;
```

Asignar usuario a otro tenant:

```sql
insert into public.memberships (tenant_id, user_id, role)
values (
  'OTRO_TENANT_UUID',
  'OTRO_USER_UUID',
  'client_user'
);
```

## 11. Crear tickets de prueba desde SQL opcional

Lo normal es crearlos desde la app. Si necesitas datos rapidos, puedes usar:

```sql
insert into public.tickets (
  tenant_id,
  title,
  description,
  status,
  created_by,
  assigned_to
)
values (
  'TENANT_UUID',
  'No puedo acceder al correo',
  'El usuario indica que no puede iniciar sesion en el correo corporativo.',
  'open',
  'CLIENT_USER_UUID',
  'AGENT_USER_UUID'
);
```

## 12. Queries utiles para la defensa

Ver tenants:

```sql
select * from public.tenants;
```

Ver memberships:

```sql
select
  m.id,
  t.name as tenant,
  m.tenant_id,
  m.user_id,
  u.email,
  m.role,
  m.created_at
from public.memberships m
join public.tenants t on t.id = m.tenant_id
left join auth.users u on u.id = m.user_id
order by m.created_at desc;
```

Ver tickets:

```sql
select
  id,
  tenant_id,
  title,
  status,
  created_by,
  assigned_to,
  created_at,
  updated_at
from public.tickets
order by created_at desc;
```

Ver politicas RLS:

```sql
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

## 13. Prueba minima recomendada

1. Usuario A entra con OAuth.
2. Creas `Tenant Demo`.
3. Asignas Usuario A como `tenant_admin`.
4. Usuario A crea un ticket.
5. Usuario B entra con OAuth.
6. Asignas Usuario B como `support_agent` del mismo tenant.
7. Asignas el ticket al Usuario B.
8. Usuario B puede editar ese ticket.
9. Creas otro tenant.
10. Usuario C pertenece al otro tenant.
11. Usuario C no debe ver tickets de `Tenant Demo`.

Con esa prueba demuestras:

- OAuth 2.
- RBAC.
- ABAC.
- aislamiento multi-tenant.
- proteccion frente a IDOR.
- enforcement en servidor y base de datos.

## 14. Problemas frecuentes

### Login correcto, pero falta membership

Solucion: crear fila en `public.memberships` para ese `auth.users.id`.

### Error de callback OAuth

Revisa:

- GitHub OAuth App callback:

```text
https://TU-PROYECTO.supabase.co/auth/v1/callback
```

- Supabase Redirect URLs:

```text
http://localhost:3000/auth/callback
```

### La app no conecta con Supabase

Revisa `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Despues de cambiar `.env`, reinicia Docker:

```powershell
docker compose down
docker compose up --build
```

### Un usuario no ve tickets

Comprueba que tenga membership:

```sql
select * from public.memberships where user_id = 'AUTH_USER_UUID';
```

Comprueba que el ticket esta en el mismo tenant:

```sql
select id, tenant_id, title from public.tickets where id = 'TICKET_UUID';
```

## 15. Resumen de lo imprescindible

Para que funcione necesitas:

1. Ejecutar `supabase/schema.sql`.
2. Activar OAuth en Supabase.
3. Configurar Redirect URLs.
4. Iniciar sesion una vez.
5. Crear un tenant.
6. Crear una membership para tu usuario.
7. Rellenar `.env`.
8. Levantar con Docker.

## 16. Desplegar en Render

Render ejecutara la misma app con el `Dockerfile` del proyecto. Supabase seguira siendo la base de datos y el proveedor de autenticacion.

### 16.1 Subir el proyecto a GitHub

1. Crea un repositorio privado en GitHub.
2. Sube el proyecto.
3. Asegurate de no subir `.env`, `node_modules`, `.next` ni `reports`.

Archivos que si deben estar:

```text
Dockerfile
docker-compose.yml
package.json
package-lock.json
app/
components/
lib/
supabase/
scripts/
.env.example
README.md
supabaseguide.md
```

### 16.2 Crear Web Service en Render

En Render:

1. Entra en `Dashboard`.
2. Pulsa `New`.
3. Elige `Web Service`.
4. Conecta tu cuenta de GitHub.
5. Selecciona el repositorio privado.
6. En tipo de despliegue, usa `Docker`.
7. Render detectara el `Dockerfile`.

Configuracion recomendada:

```text
Name: tenantdesk-min
Environment: Docker
Branch: main
Root Directory: dejar vacio si el proyecto esta en la raiz
Dockerfile Path: ./Dockerfile
```

### 16.3 Variables de entorno en Render

En el Web Service de Render, ve a `Environment` y anade:

```env
NEXT_PUBLIC_SITE_URL=https://TU-SERVICIO.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
NEXT_PUBLIC_OAUTH_PROVIDER=github
```

No uses comillas alrededor de los valores.

`NEXT_PUBLIC_SITE_URL` debe coincidir exactamente con la URL publica de Render.

### 16.4 Configurar Supabase para Render

En Supabase:

1. Ve a `Authentication`.
2. Entra en `URL Configuration`.
3. En `Redirect URLs`, anade:

```text
https://TU-SERVICIO.onrender.com/auth/callback
```

4. Si esta app desplegada va a ser tu entorno principal, puedes poner en `Site URL`:

```text
https://TU-SERVICIO.onrender.com
```

Puedes mantener tambien la URL local:

```text
http://localhost:3000/auth/callback
```

Asi podras usar local y Render a la vez.

### 16.5 Configurar GitHub OAuth para Render

Si usas GitHub como proveedor OAuth, normalmente GitHub solo necesita el callback de Supabase:

```text
https://TU-PROYECTO.supabase.co/auth/v1/callback
```

No pongas aqui `/auth/callback` de Render. Ese callback lo usa Supabase para devolver la sesion a tu app.

Valores recomendados en GitHub OAuth App:

```text
Homepage URL:
https://TU-SERVICIO.onrender.com

Authorization callback URL:
https://TU-PROYECTO.supabase.co/auth/v1/callback
```

### 16.6 Primer despliegue

En Render:

1. Pulsa `Create Web Service`.
2. Espera a que termine el build.
3. Abre la URL publica:

```text
https://TU-SERVICIO.onrender.com
```

4. Pulsa `Entrar con OAuth 2`.
5. Comprueba que vuelve correctamente a:

```text
https://TU-SERVICIO.onrender.com/tickets
```

Si el usuario ya tiene membership, vera la app. Si no, vera el aviso de membership pendiente.

### 16.7 Crear membership para usuario de Render

Si usas el mismo proveedor OAuth y el mismo usuario que en local, el `auth.users.id` sera el mismo dentro del mismo proyecto Supabase.

Compruebalo con:

```sql
select
  id,
  email,
  created_at
from auth.users
order by created_at desc;
```

Si el usuario no tiene membership:

```sql
insert into public.memberships (tenant_id, user_id, role)
values (
  'TENANT_UUID',
  'AUTH_USER_UUID',
  'tenant_admin'
);
```

### 16.8 Comprobaciones en Render

Comprueba:

1. La pagina carga.
2. El login OAuth redirige correctamente.
3. `/tickets` no se abre sin sesion.
4. Un usuario sin membership no puede usar la app.
5. Un usuario con membership ve tickets.
6. Un usuario de otro tenant no ve tickets ajenos.

### 16.9 Errores frecuentes en Render

#### Error: vuelve al login o falla el callback

Revisa en Render:

```env
NEXT_PUBLIC_SITE_URL=https://TU-SERVICIO.onrender.com
```

Revisa en Supabase `Redirect URLs`:

```text
https://TU-SERVICIO.onrender.com/auth/callback
```

#### Error: variables no encontradas

Comprueba que en Render estan definidas:

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_OAUTH_PROVIDER
```

Despues de cambiarlas, pulsa `Manual Deploy` > `Deploy latest commit` o redeploy.

#### Error: build falla

Comprueba que:

- `package-lock.json` esta subido.
- `Dockerfile` esta en la raiz.
- `Root Directory` esta vacio si el proyecto esta en la raiz del repo.
- No has subido una estructura con otra carpeta por encima del proyecto.

### 16.10 Nota sobre Docker Compose y Render

Render no usa `docker-compose.yml` para este Web Service. Usa solo el `Dockerfile`.

`docker-compose.yml` queda para:

- levantar localmente la app
- ejecutar SonarQube local
- ejecutar Dependency-Check
- ejecutar ZAP

En produccion Render ejecuta un unico contenedor de la app, que es justo lo que necesita este MVP.
