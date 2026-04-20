import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { requireMembership } from "@/lib/authz";
import type { Ticket } from "@/lib/types";

export default async function TicketsPage() {
  const { supabase, membership } = await requireMembership();
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  const tickets = (data ?? []) as Ticket[];

  return (
    <>
      <AppNav membership={membership} />
      <main className="stack">
        <div className="grid">
          <section className="panel">
            <h1>Tickets</h1>
            <p>Solo se devuelven tickets permitidos por RLS y por tenant.</p>
          </section>
          <section className="panel">
            <h2>Tenant activo</h2>
            <p><span className="badge">{membership.tenant_id}</span></p>
          </section>
        </div>
        <table>
          <thead>
            <tr>
              <th>Titulo</th>
              <th>Estado</th>
              <th>Asignado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td><Link href={`/tickets/${ticket.id}`}>{ticket.title}</Link></td>
                <td><span className="badge">{ticket.status}</span></td>
                <td>{ticket.assigned_to ?? "Sin asignar"}</td>
                <td>{new Date(ticket.created_at).toLocaleDateString("es-ES")}</td>
              </tr>
            ))}
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={4}>No hay tickets todavia.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </main>
    </>
  );
}
