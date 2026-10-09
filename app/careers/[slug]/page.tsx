import {notFound} from 'next/navigation';
import {ApplicationForm} from '../../../features/careers-ui';
import {jobs,previewEnabled,databaseReady,intakeReady} from '../../../features/careers-server';
import {sampleJobs} from '../../../features/careers-domain';
import {Fragment} from 'react';

const sectionHeaders=new Set([
  'Key Responsibilities',
  'Required Qualifications',
  'Preferred Qualifications',
  'Core Soft Skills',
  'Benefits',
  'Work Schedule',
  'Application Materials',
]);

function JobText({text}:{text:string}){
  return <p className="jobs-role-text">{text.split('\n').map((line,index)=><Fragment key={index}>{index>0?'\n':null}{sectionHeaders.has(line.trim())?<strong>{line}</strong>:line}</Fragment>)}</p>;
}

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
        <h2>The role</h2><JobText text={job.description}/>
        <h2>What you’ll bring</h2><JobText text={job.requirements}/>
        {(accepting||preview)&&job.application_instructions&&<><h2>Application materials</h2><JobText text={job.application_instructions}/></>}
      </article>
      {accepting||preview
        ? <ApplicationForm job={job} enabled={accepting} preview={preview}/>
        : <aside className="jobs-card"><h2>Applications opening soon</h2><p>We’re sharing this role while we finish setting up our application portal. Please check back here to apply.</p><a href="/careers">See all openings →</a></aside>}
    </div>
  </>;
}
