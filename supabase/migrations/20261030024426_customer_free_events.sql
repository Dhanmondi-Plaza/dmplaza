-- Free customer events are managed by staff. Only published events are public.
create table os_api.customer_events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 3 and 160),
  summary text not null check (char_length(summary) between 1 and 1000),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text not null check (char_length(location) between 3 and 200),
  capacity integer not null check (capacity between 1 and 10000),
  status text not null default 'draft' check (status in ('draft','published','closed')),
  created_at timestamptz not null default now(),
  constraint customer_events_times_valid check (ends_at > starts_at)
);

create index customer_events_public_schedule_idx
  on os_api.customer_events (starts_at) where status = 'published';

alter table os_api.customer_events enable row level security;
revoke all on os_api.customer_events from public, anon, authenticated;
grant select on os_api.customer_events to anon, authenticated;

create table os_api.customer_event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references os_api.customer_events(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  ticket_token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now(),
  constraint customer_event_registrations_one_per_customer unique (event_id, user_id)
);

create index customer_event_registrations_user_idx
  on os_api.customer_event_registrations (user_id, created_at desc);

alter table os_api.customer_event_registrations enable row level security;
revoke all on os_api.customer_event_registrations from public, anon, authenticated;
grant select on os_api.customer_event_registrations to authenticated;
grant insert (event_id, user_id) on os_api.customer_event_registrations to authenticated;
create policy customer_event_registrations_read_self on os_api.customer_event_registrations
  for select to authenticated using ((select auth.uid()) = user_id);
create policy customer_event_registrations_insert_self on os_api.customer_event_registrations
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy customer_events_public_read on os_api.customer_events
  for select to anon, authenticated using (status = 'published');
create policy customer_events_ticket_holder_read on os_api.customer_events
  for select to authenticated using (
    exists (select 1 from os_api.customer_event_registrations registration
      where registration.event_id = id and registration.user_id = (select auth.uid()))
  );

-- The row lock makes the capacity check atomic across concurrent claims.
create schema if not exists os_private;
revoke all on schema os_private from public, anon, authenticated;

create function os_private.validate_free_event_registration()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  event_capacity integer;
  claimed integer;
begin
  if (select auth.uid()) is null or new.user_id <> (select auth.uid()) then
    raise exception 'A signed-in customer is required to claim a ticket.' using errcode = '42501';
  end if;

  select capacity into event_capacity
  from os_api.customer_events
  where id = new.event_id and status = 'published' and starts_at > now()
  for update;
  if not found then
    raise exception 'This event is not open for registration.' using errcode = 'P0001';
  end if;

  select count(*) into claimed
  from os_api.customer_event_registrations where event_id = new.event_id;
  if claimed >= event_capacity then
    raise exception 'This event is full.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
revoke all on function os_private.validate_free_event_registration() from public, anon, authenticated;
create trigger validate_free_event_registration
  before insert on os_api.customer_event_registrations
  for each row execute function os_private.validate_free_event_registration();
