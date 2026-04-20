import { AppNav } from "@/components/AppNav";
import { createTicket } from "@/lib/actions";
import { requireMembership } from "@/lib/authz";

export default async function NewTicketPage() {
  const { membership } = await requireMembership();

  return (
    <>
      <AppNav membership={membership} />
      <main className="stack">
        <section className="panel stack">
          <h1>Crear ticket</h1>
          <form className="stack" action={createTicket}>
            <label>
              Titulo
              <input name="title" minLength={3} required />
            </label>
            <label>
              Descripcion
              <textarea name="description" minLength={3} required />
            </label>
            <label>
              Asignado a user_id opcional
              <input name="assigned_to" placeholder="UUID de usuario agente" />
            </label>
            <button type="submit">Crear</button>
          </form>
        </section>
      </main>
    </>
  );
}
