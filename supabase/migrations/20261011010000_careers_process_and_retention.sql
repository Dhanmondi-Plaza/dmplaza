-- Candidate-facing process copy belongs to the job, not the website slug.
alter table hiring.jobs add column if not exists public_hiring_process text not null default '';
do $$ begin
  if not exists (select 1 from pg_constraint where conrelid='hiring.jobs'::regclass and conname='jobs_public_hiring_process_length') then
    alter table hiring.jobs add constraint jobs_public_hiring_process_length check (length(public_hiring_process)<=5000);
  end if;
end $$;

update hiring.jobs as j set public_hiring_process=seed.steps
from (values
  ('executive-chef', $steps$Application and résumé review, including any optional menu or food examples.
A structured interview about culinary leadership, Indian and Chinese cuisine, team development, and kitchen judgment.
Finalists complete a practical culinary assessment. We will explain its format and main evaluation criteria in advance.
Final review and reference checks before a hiring decision.$steps$),
  ('lead-barista', $steps$Application review, including your example of a drink you developed or improved and any optional work samples.
A 20-minute screening conversation, followed by a 45-minute review of your drink concepts and personal contributions.
Finalists complete a paid on-site beverage practical, including recipe documentation so another barista could reproduce a drink.
Final decision and reference checks.$steps$),
  ('content-community-manager', $steps$Portfolio and application review, followed by a structured interview about your personal contribution to the work shown.
A live discussion of content, founder-story, and community scenarios. The initial application does not require you to produce or edit content.
Finalists complete a paid on-site field test involving observation, filming, and a short-form content piece.
Final debrief and reference checks.$steps$),
  ('junior-cook', $steps$Application review focused on relevant experience, reliability, and willingness to learn.
A short screening interview.
Finalists may complete a practical kitchen-skills assessment. We will explain the format in advance.
Team-fit discussion and reference checks before a hiring decision.$steps$),
  ('mocktail-bartender-beverage-specialist', $steps$Application and optional beverage-work review, followed by a screening interview.
A discussion of beverages you personally developed or improved and the choices behind them.
Finalists may complete a paid practical beverage assessment. We will explain the format and criteria in advance.
Final interview, reference checks, and hiring decision.$steps$),
  ('dishwasher-kitchen-steward', $steps$Application review focused on sanitation, reliability, and relevant kitchen experience.
A short screening interview.
Finalists may complete a short practical work assessment. We will explain the format and expectations in advance.
Reliability and team-fit discussion, then reference checks before a hiring decision.$steps$),
  ('maintenance-team-member', $steps$Application review focused on safety, preventive maintenance, and relevant experience.
A structured screening interview about troubleshooting and when to escalate a problem.
Finalists may complete a practical assessment of basic, non-licensed maintenance tasks. We will explain the format and criteria in advance.
Safety and team-fit discussion, then reference checks before a hiring decision.$steps$),
  ('executive-chef-practical-assessment-judge', $steps$Application review of your culinary background and professional experience.
Selected professionals may have a brief discussion to confirm availability, compensation, and potential conflicts of interest.
The engagement is an in-person, one-day assessment. Judges submit independent scores and written observations.$steps$)
) as seed(slug,steps)
where j.slug=seed.slug and j.public_hiring_process='';

-- Preserve the current permission, version, and audit logic in DM Plaza OS.
-- Extend only the accepted patch and update assignment.
do $$
declare ddl text; modified text;
begin
  ddl:=pg_get_functiondef('private.save_hiring_job_internal(uuid,uuid,integer,jsonb,text,text)'::regprocedure);
  modified:=replace(ddl,
    '''application_instructions'',''internal_hiring_workflow''',
    '''application_instructions'',''public_hiring_process'',''internal_hiring_workflow''');
  if modified=ddl then raise exception 'Job save allowlist changed; review migration'; end if;
  ddl:=modified;
  modified:=replace(ddl,
    'internal_hiring_workflow=coalesce(p_patch->>''internal_hiring_workflow'',internal_hiring_workflow),team=',
    'internal_hiring_workflow=coalesce(p_patch->>''internal_hiring_workflow'',internal_hiring_workflow),public_hiring_process=coalesce(p_patch->>''public_hiring_process'',public_hiring_process),team=');
  if modified=ddl then raise exception 'Job save assignment changed; review migration'; end if;
  execute modified;
end $$;

create or replace function os_api.list_careers_jobs_v3(p_organization uuid)
returns table (
  id uuid, business_id uuid, brand text, slug text, title text, location text,
  employment_type text, description text, requirements text, openings integer,
  team text, compensation text, questions jsonb, created_at timestamptz,
  resume_required boolean, application_instructions text,
  portfolio_required boolean, linkedin_required boolean,
  display_priority integer, is_featured boolean, public_hiring_process text
)
language sql stable security definer set search_path=''
as $function$
  select j.id,j.business_id,b.name,j.slug,j.title,j.location,j.employment_type,
    j.description,j.requirements,j.openings,j.team,j.compensation,j.questions,
    j.created_at,j.resume_required,j.application_instructions,j.portfolio_required,
    j.linkedin_required,j.display_priority,j.is_featured,j.public_hiring_process
  from hiring.jobs j
  join core.businesses b on (b.organization_id,b.id)=(j.organization_id,j.business_id)
  where j.organization_id=p_organization and j.visibility='listed'
  order by j.display_priority asc,j.created_at desc;
$function$;
revoke all on function os_api.list_careers_jobs_v3(uuid) from public;
grant execute on function os_api.list_careers_jobs_v3(uuid) to anon,authenticated;

-- The maintenance runner receives IDs only; applicant fields never leave the DB.
alter table private.careers_intakes add column if not exists purged_at timestamptz;
create or replace function os_api.list_expired_careers_intakes()
returns table (id uuid, organization_id uuid, state text)
language plpgsql security definer set search_path=''
as $function$
begin
  if auth.role() <> 'service_role' then raise exception 'Not authorized' using errcode='42501'; end if;
  return query select i.id,i.organization_id,i.state
    from private.careers_intakes i
    where i.purged_at is null and (
      (i.state='reserved' and i.created_at<now()-interval '2 days')
       or (i.state='completed' and i.created_at<now()-interval '30 days')
    )
    order by i.created_at limit 100;
end;
$function$;
revoke all on function os_api.list_expired_careers_intakes() from public;
grant execute on function os_api.list_expired_careers_intakes() to service_role;

create or replace function os_api.purge_expired_careers_intake(p_intake uuid)
returns boolean
language plpgsql security definer set search_path=''
as $function$
declare r private.careers_intakes;
begin
  if auth.role() <> 'service_role' then raise exception 'Not authorized' using errcode='42501'; end if;
  select * into r from private.careers_intakes where id=p_intake for update;
  if not found or r.purged_at is not null then return false; end if;
  if not ((r.state='reserved' and r.created_at<now()-interval '2 days')
    or (r.state='completed' and r.created_at<now()-interval '30 days')) then return false; end if;
  if r.state='reserved' and exists (
    select 1 from storage.objects o where o.bucket_id='hiring-resumes'
      and o.name like r.organization_id::text||'/'||r.id::text||'/%'
  ) then return false; end if;
  update private.careers_intakes
    set fields='{}'::jsonb,files='[]'::jsonb,questions_snapshot='[]'::jsonb,
        ip_hash='',email_hash='',payload_hash='',purged_at=now()
    where id=r.id;
  return true;
end;
$function$;
revoke all on function os_api.purge_expired_careers_intake(uuid) from public;
grant execute on function os_api.purge_expired_careers_intake(uuid) to service_role;
