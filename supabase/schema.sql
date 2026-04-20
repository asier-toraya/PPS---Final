create extension if not exists "pgcrypto";

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'basic' check (plan in ('basic', 'pro')),
  created_at timestamptz not null default now()
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('super_admin', 'tenant_admin', 'support_agent', 'client_user')),
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  description text not null check (char_length(description) between 3 and 2000),
  status text not null default 'open' check (status in ('open', 'in_progress', 'closed')),
  created_by uuid not null references auth.users(id),
  assigned_to uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from memberships
    where user_id = auth.uid()
    and role = 'super_admin'
  );
$$;

create or replace function public.has_role(target_tenant uuid, allowed_roles text[])
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from memberships
    where user_id = auth.uid()
    and tenant_id = target_tenant
    and role = any(allowed_roles)
  );
$$;

alter table public.tenants enable row level security;
alter table public.memberships enable row level security;
alter table public.tickets enable row level security;

drop policy if exists tenants_select on public.tenants;
create policy tenants_select on public.tenants
for select using (
  public.is_super_admin()
  or exists (
    select 1 from public.memberships m
    where m.tenant_id = tenants.id and m.user_id = auth.uid()
  )
);

drop policy if exists memberships_select on public.memberships;
create policy memberships_select on public.memberships
for select using (
  public.is_super_admin()
  or public.has_role(tenant_id, array['tenant_admin'])
  or user_id = auth.uid()
);

drop policy if exists memberships_insert on public.memberships;
create policy memberships_insert on public.memberships
for insert with check (
  public.is_super_admin()
  or (
    public.has_role(tenant_id, array['tenant_admin'])
    and role <> 'super_admin'
  )
);

drop policy if exists memberships_update on public.memberships;
create policy memberships_update on public.memberships
for update using (
  public.is_super_admin()
  or public.has_role(tenant_id, array['tenant_admin'])
) with check (
  public.is_super_admin()
  or (
    public.has_role(tenant_id, array['tenant_admin'])
    and role <> 'super_admin'
  )
);

drop policy if exists tickets_select on public.tickets;
create policy tickets_select on public.tickets
for select using (
  public.is_super_admin()
  or exists (
    select 1 from public.memberships m
    where m.tenant_id = tickets.tenant_id and m.user_id = auth.uid()
  )
);

drop policy if exists tickets_insert on public.tickets;
create policy tickets_insert on public.tickets
for insert with check (
  public.is_super_admin()
  or (
    created_by = auth.uid()
    and public.has_role(tenant_id, array['tenant_admin', 'support_agent', 'client_user'])
  )
);

drop policy if exists tickets_update on public.tickets;
create policy tickets_update on public.tickets
for update using (
  public.is_super_admin()
  or public.has_role(tenant_id, array['tenant_admin'])
  or (
    public.has_role(tenant_id, array['support_agent'])
    and assigned_to = auth.uid()
  )
) with check (
  public.is_super_admin()
  or public.has_role(tenant_id, array['tenant_admin'])
  or (
    public.has_role(tenant_id, array['support_agent'])
    and assigned_to = auth.uid()
  )
);

grant usage on schema public to authenticated;
grant select on public.tenants to authenticated;
grant select, insert, update on public.memberships to authenticated;
grant select, insert, update on public.tickets to authenticated;
grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.has_role(uuid, text[]) to authenticated;
