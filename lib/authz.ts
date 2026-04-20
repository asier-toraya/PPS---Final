import { redirect, notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";
import type { Membership, Role, Ticket, TicketStatus } from "@/lib/types";

export async function requireMembership() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("memberships")
    .select("id, tenant_id, user_id, role")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    redirect("/login?missingMembership=1");
  }

  return { supabase, user, membership: data as Membership };
}

export function canCreateTicket(role: Role) {
  return role === "tenant_admin" || role === "support_agent" || role === "client_user" || role === "super_admin";
}

export function canUseAdmin(role: Role) {
  return role === "tenant_admin" || role === "super_admin";
}

export function canEditTicket(membership: Membership, ticket: Ticket) {
  if (membership.role === "super_admin" || membership.role === "tenant_admin") return true;
  if (membership.role === "support_agent") return ticket.assigned_to === membership.user_id;
  return false;
}

export function assertAllowedStatusChange(membership: Membership, current: Ticket, nextStatus: TicketStatus) {
  if (!canEditTicket(membership, current)) {
    notFound();
  }

  if (current.status === "closed" && membership.role !== "tenant_admin" && membership.role !== "super_admin") {
    throw new Error("Solo tenant_admin o super_admin pueden reabrir tickets cerrados");
  }
}
