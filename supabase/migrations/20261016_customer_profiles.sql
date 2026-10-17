create table public.customer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  favorite_brands text[] not null default '{}',
  updated_at timestamptz not null default now(),
  constraint customer_profiles_favorite_brands_valid check (
    favorite_brands <@ array['Desi Dragon','Pearl & Leaf','Nature’s Bazaar','Meridian Hill','Top-Level Urgent Care']::text[]
    and cardinality(favorite_brands) <= 5
  )
);

alter table public.customer_profiles enable row level security;
revoke all on public.customer_profiles from anon, public;
grant select, insert, update on public.customer_profiles to authenticated;

create policy customer_profiles_read_self on public.customer_profiles
  for select to authenticated using ((select auth.uid()) = user_id);
create policy customer_profiles_insert_self on public.customer_profiles
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy customer_profiles_update_self on public.customer_profiles
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
