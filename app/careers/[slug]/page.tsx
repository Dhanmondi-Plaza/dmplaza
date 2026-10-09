import {notFound} from 'next/navigation';
import {ApplicationForm} from '../../../features/careers-ui';
import {jobs,previewEnabled,databaseReady,intakeReady} from '../../../features/careers-server';
import {sampleJobs} from '../../../features/careers-domain';

export const dynamic='force-dynamic';

export default async function Page({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{preview?:string}>}){
  const {slug}=await params;
  const preview=previewEnabled()&&((await searchParams).preview==='1'||!databaseReady());
  const list=preview?sampleJobs:await jobs();
  const job=list.find(j=>j.slug===slug);
  if(!job)notFound();
  const accepting=!preview&&intakeReady();
  return <>
    <p><a href="/careers">← All opportunities</a></p>
    <div className="jobs-role">
      <article className="jobs-role-copy">
        <p className="jobs-eyebrow">{job.brand}</p>
        <h1>{job.title}</h1>
        <p>{job.location} · {job.employment_type}</p>
        <p className="jobs-pay">{job.compensation}</p>
        <h2>The role</h2><p>{job.description}</p>
        <h2>What you’ll bring</h2><p>{job.requirements}</p>
        {(accepting||preview)&&job.application_instructions&&<><h2>Application materials</h2><p>{job.application_instructions}</p></>}
      </article>
      {accepting||preview
        ? <ApplicationForm job={job} enabled={accepting} preview={preview}/>
        : <aside className="jobs-card"><h2>Applications opening soon</h2><p>We’re sharing this role while we finish setting up our application portal. Please check back here to apply.</p><a href="/careers">See all openings →</a></aside>}
    </div>
  </>;
}
