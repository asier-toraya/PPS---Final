export type Role = "super_admin" | "tenant_admin" | "support_agent" | "client_user";

export type TicketStatus = "open" | "in_progress" | "closed";

export type Membership = {
  id: string;
  tenant_id: string;
  user_id: string;
  role: Role;
};

export type Ticket = {
  id: string;
  tenant_id: string;
  title: string;
  description: string;
  status: TicketStatus;
  created_by: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
};
