create table if not exists integration.public_signup_limits (
 organization_id uuid not null references core.organizations(id),
 scope text not null check(scope in('homepage','bazaar')),
 ip_hash text not null check(ip_hash ~ '^[a-f0-9]{64}$'),
 window_start timestamptz not null,
 requests integer not null check(requests between 1 and 51),
 primary key(organization_id,scope,ip_hash,window_start)
);
create index if not exists public_signup_limits_expiry on integration.public_signup_limits(window_start);
alter table integration.public_signup_limits enable row level security;
revoke all on integration.public_signup_limits from public,anon,authenticated,service_role;

create or replace function os_api.reserve_public_signup_request(p_org uuid,p_scope text,p_ip_hash text)
returns boolean language plpgsql security definer set search_path='' as $$
declare bucket timestamptz:=date_bin(interval '10 minutes',now(),timestamptz '1970-01-01');n integer;
begin
 if p_org is null or p_scope is null or p_scope not in('homepage','bazaar') or p_ip_hash is null or p_ip_hash !~ '^[a-f0-9]{64}$' then
  raise exception 'Invalid signup budget request' using errcode='22023';
 end if;
 -- Expire only these temporary anti-abuse counters, never customer or applicant records.
 delete from integration.public_signup_limits where (organization_id,scope,ip_hash,window_start) in(
  select organization_id,scope,ip_hash,window_start from integration.public_signup_limits
  where window_start<now()-interval '24 hours' order by window_start limit 1000
 );
 insert into integration.public_signup_limits values(p_org,p_scope,p_ip_hash,bucket,1)
 on conflict(organization_id,scope,ip_hash,window_start) do update set requests=least(public_signup_limits.requests+1,51)
 returning requests into n;
 return n<=50;
end;$$;
revoke all on function os_api.reserve_public_signup_request(uuid,text,text) from public,anon,authenticated;
grant execute on function os_api.reserve_public_signup_request(uuid,text,text) to service_role;
