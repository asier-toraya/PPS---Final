import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { createMembership } from "@/lib/actions";
import { canUseAdmin, requireMembership } from "@/lib/authz";
import { findAuthUsersByEmail } from "@/lib/supabase";

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; selectedUserId?: string }>;
}) {
  const params = await searchParams;
  const { supabase, membership } = await requireMembership();

  if (!canUseAdmin(membership.role)) {
    throw new Error("No autorizado");
  }

  const { data, error } = await supabase
    .from("memberships")
    .select("id, tenant_id, user_id, role, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const query = String(params.q ?? "").trim();
  const selectedUserId = String(params.selectedUserId ?? "").trim();
  const userSearchEnabled = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const foundUsers = userSearchEnabled && query.length >= 2 ? await findAuthUsersByEmail(query) : [];

  return (
    <>
      <AppNav membership={membership} />
      <main className="stack">
        <section className="panel stack">
          <h1>Admin minimo</h1>
          <p>Tenant admin gestiona usuarios de su tenant. Super admin puede indicar otro tenant_id.</p>
        </section>
        <section className="panel stack">
          <h2>Buscar usuarios existentes</h2>
          <p>Busca por email en Supabase Auth y selecciona el usuario antes de crear la membership.</p>
          {userSearchEnabled ? (
            <>
              <form className="grid" method="get">
                <label>
                  Buscar por email
                  <input name="q" defaultValue={query} minLength={2} placeholder="usuario@dominio.com" />
                </label>
                <div>
                  <button type="submit">Buscar</button>
                </div>
              </form>
              {query.length > 0 && query.length < 2 ? (
                <p className="error">Escribe al menos 2 caracteres para buscar.</p>
              ) : null}
              {query.length >= 2 ? (
                foundUsers.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>user_id</th>
                        <th>Alta</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {foundUsers.map((user) => (
                        <tr key={user.id}>
                          <td>{user.email ?? "Sin email"}</td>
                          <td>{user.id}</td>
                          <td>{user.created_at ? new Date(user.created_at).toLocaleString("es-ES") : "-"}</td>
                          <td>
                            <Link
                              className="button secondary"
                              href={`/admin?q=${encodeURIComponent(query)}&selectedUserId=${encodeURIComponent(user.id)}`}
                            >
                              Seleccionar
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No hay usuarios que coincidan con esa busqueda.</p>
                )
              ) : null}
            </>
          ) : (
            <p className="error">
              La busqueda de usuarios requiere configurar <code>SUPABASE_SERVICE_ROLE_KEY</code> en el entorno del servidor.
            </p>
          )}
        </section>
        <section className="panel stack">
          <h2>Crear membership</h2>
          <form className="stack" action={createMembership}>
            <label>
              user_id de Supabase Auth
              <input name="user_id" defaultValue={selectedUserId} required />
            </label>
            {membership.role === "super_admin" ? (
              <label>
                tenant_id
                <input name="tenant_id" defaultValue={membership.tenant_id} required />
              </label>
            ) : null}
            <label>
              Rol
              <select name="role" defaultValue="client_user">
                <option value="tenant_admin">tenant_admin</option>
                <option value="support_agent">support_agent</option>
                <option value="client_user">client_user</option>
              </select>
            </label>
            <button type="submit">Crear membership</button>
          </form>
        </section>
        <table>
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Usuario</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((row) => (
              <tr key={row.id}>
                <td>{row.tenant_id}</td>
                <td>{row.user_id}</td>
                <td><span className="badge">{row.role}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  );
}
