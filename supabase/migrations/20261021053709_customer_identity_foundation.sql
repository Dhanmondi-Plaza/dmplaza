-- Auth user UUID remains the immutable customer ID. Existing profiles are preserved.
alter table os_api.customer_profiles
  add column if not exists display_name text
    check (display_name is null or char_length(display_name) between 1 and 100);

create table if not exists os_api.customer_external_identities (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  external_system text not null check (external_system in ('toast')),
  external_location text not null,
  external_customer_id text not null,
  linkage_method text not null check (linkage_method in ('authenticated_order','staff_verified')),
  link_status text not null default 'verified' check (link_status in ('verified','disputed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (external_system, external_location, external_customer_id),
  check (char_length(external_location) between 1 and 100),
  check (char_length(external_customer_id) between 1 and 200)
);
create index if not exists customer_external_identities_customer_idx
  on os_api.customer_external_identities (customer_id);
alter table os_api.customer_external_identities enable row level security;
revoke all on os_api.customer_external_identities from public, anon, authenticated;
grant select on os_api.customer_external_identities to authenticated;
create policy customer_external_identities_read_self
  on os_api.customer_external_identities for select to authenticated
  using ((select auth.uid()) = customer_id);
-- Linking requires a verified ordering flow or staff process; clients cannot write mappings.

create table if not exists os_api.customer_marketing_consents (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  channel text not null check (channel in ('email','sms')),
  consented boolean not null,
  notice_version text not null check (char_length(notice_version) between 1 and 40),
  created_at timestamptz not null default now()
);
create index if not exists customer_marketing_consents_latest_idx
  on os_api.customer_marketing_consents (customer_id, channel, created_at desc);
alter table os_api.customer_marketing_consents enable row level security;
revoke all on os_api.customer_marketing_consents from public, anon, authenticated;
grant select, insert on os_api.customer_marketing_consents to authenticated;
create policy customer_marketing_consents_read_self
  on os_api.customer_marketing_consents for select to authenticated
  using ((select auth.uid()) = customer_id);
create policy customer_marketing_consents_insert_self
  on os_api.customer_marketing_consents for insert to authenticated
  with check ((select auth.uid()) = customer_id);
-- Append-only consent evidence; never infer marketing permission from account creation.

create table if not exists os_api.customer_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','processing','completed','rejected')),
  requested_at timestamptz not null default now(),
  resolved_at timestamptz
);
create unique index if not exists customer_deletion_requests_one_open_idx
  on os_api.customer_deletion_requests (customer_id) where status in ('pending','processing');
alter table os_api.customer_deletion_requests enable row level security;
revoke all on os_api.customer_deletion_requests from public, anon, authenticated;
grant select, insert on os_api.customer_deletion_requests to authenticated;
create policy customer_deletion_requests_read_self
  on os_api.customer_deletion_requests for select to authenticated
  using ((select auth.uid()) = customer_id);
create policy customer_deletion_requests_insert_self
  on os_api.customer_deletion_requests for insert to authenticated
  with check ((select auth.uid()) = customer_id and status = 'pending' and resolved_at is null);
