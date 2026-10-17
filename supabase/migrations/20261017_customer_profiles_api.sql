-- The project exposes os_api through PostgREST; public is not exposed.
alter table public.customer_profiles set schema os_api;
