import { notFound } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { updateTicket } from "@/lib/actions";
import { canEditTicket, requireMembership } from "@/lib/authz";
import type { Ticket } from "@/lib/types";

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const routeParams = await params;
  const { supabase, membership } = await requireMembership();
  const { data, error } = await supabase.from("tickets").select("*").eq("id", routeParams.id).maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) notFound();

  const ticket = data as Ticket;
  const editable = canEditTicket(membership, ticket);

  return (
    <>
      <AppNav membership={membership} />
      <main className="stack">
        <section className="panel stack">
          <div>
            <h1>{ticket.title}</h1>
            <p>{ticket.description}</p>
          </div>
          <div className="grid">
            <p><strong>Estado:</strong> <span className="badge">{ticket.status}</span></p>
            <p><strong>Creado por:</strong> {ticket.created_by}</p>
            <p><strong>Asignado a:</strong> {ticket.assigned_to ?? "Sin asignar"}</p>
            <p><strong>Tenant:</strong> {ticket.tenant_id}</p>
          </div>
        </section>
        {editable ? (
          <section className="panel stack">
            <h2>Actualizar ticket</h2>
            <form className="stack" action={updateTicket}>
              <input type="hidden" name="id" value={ticket.id} />
              <label>
                Estado
                <select name="status" defaultValue={ticket.status}>
                  <option value="open">open</option>
                  <option value="in_progress">in_progress</option>
                  <option value="closed">closed</option>
                </select>
              </label>
              <label>
                Asignado a
                <input name="assigned_to" defaultValue={ticket.assigned_to ?? ""} />
              </label>
              <button type="submit">Guardar</button>
            </form>
          </section>
        ) : (
          <section className="panel">
            <p>No puedes editar este ticket por RBAC/ABAC.</p>
          </section>
        )}
      </main>
    </>
  );
}
