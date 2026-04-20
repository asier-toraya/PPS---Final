Para levantarlo, copia primero .env.example a .env, rellena Supabase y ejecuta:

  docker compose up --build

  Lo único pendiente, porque depende de cuentas externas, es configurar Supabase: ejecutar supabase/schema.sql, activar el proveedor
  OAuth 2, crear el primer tenant y asignar una membership inicial al usuario autenticado. Todo eso queda explicado en el README con los
  pasos mínimos.

En el otro PC el flujo sería:

  git clone URL_DE_TU_REPO_PRIVADO
  cd "PPS - Final"
  Copy-Item .env.example .env

  Luego editas .env con tus valores reales de Supabase:

  NEXT_PUBLIC_SITE_URL=http://localhost:3000
  NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
  NEXT_PUBLIC_OAUTH_PROVIDER=github

  Y levantas:

  docker compose up --build

  También puedes instalar dependencias localmente si quieres trabajar sin Docker:

  npm install
  npm run dev

  Pero para replicarlo como proyecto de la asignatura, lo más limpio es usar Docker.

  Importante: en el otro PC seguirás necesitando la misma configuración externa:

  - El proyecto de Supabase ya creado.
  - El SQL de supabase/schema.sql aplicado.
  - El proveedor OAuth configurado en Supabase.
  - El callback local permitido: http://localhost:3000/auth/callback.
  - Las variables de .env correctas.