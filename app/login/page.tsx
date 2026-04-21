import { signInWithOAuth, signOut } from "@/lib/actions";
import { createSupabaseServerClient } from "@/lib/supabase";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ missingMembership?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user && !params.missingMembership) {
    redirect("/tickets");
  }

  return (
    <main className="stack">
      <section className="panel stack">
        <div>
          <h1>TenantDesk Min</h1>
          <p>Service desk minimo para demostrar OAuth 2, RBAC, ABAC y aislamiento multi-tenant.</p>
        </div>
        {params.missingMembership ? (
          <p className="error">
            Login correcto, pero este usuario aun no tiene membership. Crea una fila en Supabase para asignarle tenant y rol.
          </p>
        ) : null}
        {params.missingMembership && user ? (
          <form action={signOut}>
            <button className="secondary" type="submit">Salir</button>
          </form>
        ) : (
          <form action={signInWithOAuth}>
            <button type="submit">Entrar con OAuth 2</button>
          </form>
        )}
      </section>
    </main>
  );
}
