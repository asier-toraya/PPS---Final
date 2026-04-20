import Link from "next/link";
import { signOut } from "@/lib/actions";
import type { Membership } from "@/lib/types";

export function AppNav({ membership }: { membership: Membership }) {
  const canUseAdmin = membership.role === "super_admin" || membership.role === "tenant_admin";

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/tickets"><strong>TenantDesk Min</strong></Link>
        <nav className="nav" aria-label="Principal">
          <Link href="/tickets">Tickets</Link>
          <Link href="/tickets/new">Crear ticket</Link>
          {canUseAdmin ? <Link href="/admin">Admin</Link> : null}
          <span className="badge">{membership.role}</span>
          <form action={signOut}>
            <button className="secondary" type="submit">Salir</button>
          </form>
        </nav>
      </div>
    </header>
  );
}
