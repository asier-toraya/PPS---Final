"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";
import { assertAllowedStatusChange, canCreateTicket, canUseAdmin, requireMembership } from "@/lib/authz";
import type { Role, Ticket, TicketStatus } from "@/lib/types";

export async function signInWithOAuth() {
  const supabase = await createSupabaseServerClient();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const provider = (process.env.NEXT_PUBLIC_OAUTH_PROVIDER ?? "github") as "github" | "google" | "azure";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${siteUrl}/auth/callback`
    }
  });

  if (error) throw new Error(error.message);
  if (data.url) redirect(data.url);
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createTicket(formData: FormData) {
  const { supabase, user, membership } = await requireMembership();

  if (!canCreateTicket(membership.role)) {
    throw new Error("No tienes permisos para crear tickets");
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const assignedToRaw = String(formData.get("assigned_to") ?? "").trim();
  const assignedTo = assignedToRaw.length > 0 ? assignedToRaw : null;

  if (title.length < 3 || description.length < 3) {
    throw new Error("Titulo y descripcion deben tener al menos 3 caracteres");
  }

  const { data, error } = await supabase
    .from("tickets")
    .insert({
      tenant_id: membership.tenant_id,
      title,
      description,
      created_by: user.id,
      assigned_to: assignedTo,
      status: "open"
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/tickets");
  redirect(`/tickets/${data.id}`);
}

export async function updateTicket(formData: FormData) {
  const { supabase, membership } = await requireMembership();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "open") as TicketStatus;
  const assignedToRaw = String(formData.get("assigned_to") ?? "").trim();
  const assignedTo = assignedToRaw.length > 0 ? assignedToRaw : null;

  const { data: current, error: readError } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", id)
    .single();

  if (readError) throw new Error(readError.message);

  assertAllowedStatusChange(membership, current as Ticket, status);

  const updateData =
    membership.role === "client_user"
      ? { updated_at: new Date().toISOString() }
      : { status, assigned_to: assignedTo, updated_at: new Date().toISOString() };

  const { error } = await supabase.from("tickets").update(updateData).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/tickets/${id}`);
  revalidatePath("/tickets");
}

export async function createMembership(formData: FormData) {
  const { supabase, membership } = await requireMembership();

  if (!canUseAdmin(membership.role)) {
    throw new Error("No tienes permisos de administracion");
  }

  const userId = String(formData.get("user_id") ?? "").trim();
  const role = String(formData.get("role") ?? "client_user") as Role;

  if (role === "super_admin" && membership.role !== "super_admin") {
    throw new Error("Solo super_admin puede crear otro super_admin");
  }
  const tenantId =
    membership.role === "super_admin"
      ? String(formData.get("tenant_id") ?? membership.tenant_id).trim()
      : membership.tenant_id;

  const { error } = await supabase.from("memberships").insert({
    tenant_id: tenantId,
    user_id: userId,
    role
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}
