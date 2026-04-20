import { AppNav } from "@/components/AppNav";
import { createMembership } from "@/lib/actions";
import { canUseAdmin, requireMembership } from "@/lib/authz";

export default async function AdminPage() {
  const { supabase, membership } = await requireMembership();

  if (!canUseAdmin(membership.role)) {
    throw new Error("No autorizado");
  }

  const { data, error } = await supabase
    .from("memberships")
    .select("id, tenant_id, user_id, role, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (
    <>
      <AppNav membership={membership} />
      <main className="stack">
        <section className="panel stack">
          <h1>Admin minimo</h1>
          <p>Tenant admin gestiona usuarios de su tenant. Super admin puede indicar otro tenant_id.</p>
          <form className="stack" action={createMembership}>
            <label>
              user_id de Supabase Auth
              <input name="user_id" required />
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
