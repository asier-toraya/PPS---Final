import { signInWithOAuth } from "@/lib/actions";
import { createSupabaseServerClient } from "@/lib/supabase";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams
}: {
  searchParams: { missingMembership?: string };
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user && !searchParams.missingMembership) {
    redirect("/tickets");
  }

  return (
    <main className="stack">
      <section className="panel stack">
        <div>
          <h1>TenantDesk Min</h1>
          <p>Service desk minimo para demostrar OAuth 2, RBAC, ABAC y aislamiento multi-tenant.</p>
        </div>
        {searchParams.missingMembership ? (
          <p className="error">
            Login correcto, pero este usuario aun no tiene membership. Crea una fila en Supabase para asignarle tenant y rol.
          </p>
        ) : null}
        <form action={signInWithOAuth}>
          <button type="submit">Entrar con OAuth 2</button>
        </form>
      </section>
    </main>
  );
}
