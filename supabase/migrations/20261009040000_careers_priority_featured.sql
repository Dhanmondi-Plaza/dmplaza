-- Priority and featured status remain part of the existing hiring.jobs source of truth.
alter table hiring.jobs add column if not exists display_priority integer not null default 1000;
alter table hiring.jobs add column if not exists is_featured boolean not null default false;
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'hiring.jobs'::regclass and conname = 'jobs_display_priority_positive'
  ) then
    alter table hiring.jobs add constraint jobs_display_priority_positive check (display_priority > 0);
  end if;
end $$;

update hiring.jobs set
  display_priority = case slug
    when 'executive-chef' then 1
    when 'lead-barista' then 2
    when 'content-community-manager' then 3
    when 'junior-cook' then 4
    when 'mocktail-bartender-beverage-specialist' then 5
    when 'dishwasher-kitchen-steward' then 6
    when 'maintenance-team-member' then 7
    when 'executive-chef-practical-assessment-judge' then 8
    else display_priority end,
  is_featured = slug in ('executive-chef','lead-barista','content-community-manager')
where organization_id in (select id from core.organizations where name = 'DM Plaza')
  and slug in (
    'executive-chef','lead-barista','content-community-manager','junior-cook',
    'mocktail-bartender-beverage-specialist','dishwasher-kitchen-steward',
    'maintenance-team-member','executive-chef-practical-assessment-judge'
  );

-- A versioned public RPC keeps existing clients of list_careers_jobs intact.
create or replace function os_api.list_careers_jobs_v2(p_organization uuid)
returns table (
  id uuid, business_id uuid, brand text, slug text, title text, location text,
  employment_type text, description text, requirements text, openings integer,
  team text, compensation text, questions jsonb, created_at timestamptz,
  resume_required boolean, application_instructions text,
  portfolio_required boolean, linkedin_required boolean,
  display_priority integer, is_featured boolean
)
language sql stable security definer set search_path = ''
as $function$
  select j.id,j.business_id,b.name,j.slug,j.title,j.location,j.employment_type,
    j.description,j.requirements,j.openings,j.team,j.compensation,j.questions,
    j.created_at,j.resume_required,j.application_instructions,j.portfolio_required,
    j.linkedin_required,j.display_priority,j.is_featured
  from hiring.jobs j
  join core.businesses b on (b.organization_id,b.id)=(j.organization_id,j.business_id)
  where j.organization_id=p_organization and j.visibility='listed'
  order by j.display_priority asc,j.created_at desc;
$function$;

revoke all on function os_api.list_careers_jobs_v2(uuid) from public;
grant execute on function os_api.list_careers_jobs_v2(uuid) to anon, authenticated;
