import {notFound} from 'next/navigation';
import {ApplicationForm} from '../../../features/careers-ui';
import {jobs,previewEnabled,databaseReady,intakeReady} from '../../../features/careers-server';
import {sampleJobs} from '../../../features/careers-domain';

const sectionHeaders=new Set([
  'Key Responsibilities',
  'Required Qualifications',
  'Preferred Qualifications',
  'Core Soft Skills',
  'Benefits',
  'Work Schedule',
  'Application Materials',
  'What This Role Owns',
  'Brand and Marketing Expectations',
  'Why Join Pearl & Leaf',
  'Soft Skills We Value',
  'Community and Partnership Skills',
  'On-Camera Expectations',
  'What This Role Is Not',
  'What Success Looks Like',
  'Scoring and Feedback',
  'Cuisine Background',
  'Independence and Conflict of Interest',
  'Expected Deliverables',
  'Required Soft Skills',
  'Hard Skills and Technical Requirements',
  'Hard Skills and Experience',
  'Core Responsibilities',
  'Why Join Desi Dragon',
]);

type ContentBlock={kind:'heading'|'paragraph'|'lead'|'list';value:string|string[]};

function cleanLine(line:string){
  return line.trim().replace(/^#{1,3}\s*/,'').replace(/^\*\*(.*?)\*\*$/,'$1').trim();
}

function contentBlocks(text:string):ContentBlock[]{
  const blocks:ContentBlock[]=[];
  let paragraph:string[]=[];
  let list:string[]=[];
  const flush=()=>{
    if(paragraph.length){blocks.push({kind:'paragraph',value:paragraph.join(' ')});paragraph=[]}
    if(list.length){blocks.push({kind:'list',value:list});list=[]}
  };
  for(const raw of text.replace(/\r\n?/g,'\n').split('\n')){
    const line=cleanLine(raw);
    if(!line){flush();continue}
    if(sectionHeaders.has(line)){flush();blocks.push({kind:'heading',value:line});continue}
    if(line==='The role offers:'){flush();blocks.push({kind:'lead',value:line});continue}
    const bullet=line.match(/^(?:•|●|[-*])\s+(.+)$/);
    if(bullet){
      if(paragraph.length){blocks.push({kind:'paragraph',value:paragraph.join(' ')});paragraph=[]}
      list.push(bullet[1]);
    }else{
      if(list.length){blocks.push({kind:'list',value:list});list=[]}
      paragraph.push(line);
    }
  }
  flush();
  return blocks;
}

function JobText({text}:{text:string}){
  return <div className="jobs-role-text">{contentBlocks(text).map((block,index)=>
    block.kind==='heading'?<h3 key={index}>{block.value as string}</h3>:
    block.kind==='list'?<ul key={index}>{(block.value as string[]).map((item,itemIndex)=><li key={itemIndex}>{item}</li>)}</ul>:
    block.kind==='lead'?<p className="jobs-role-lead" key={index}><strong>{block.value as string}</strong></p>:
    <p key={index}>{block.value as string}</p>
  )}</div>;
}

function splitDescription(description:string){
  const lines=description.replace(/\r\n?/g,'\n').split('\n');
  let reportsTo='';
  if(['Desi Dragon - DM Plaza','DM Plaza / Desi Dragon'].includes(lines[0]?.trim()))lines.shift();
  const reportIndex=lines.findIndex((line,index)=>index<4&&line.trim().startsWith('Reports to:'));
  if(reportIndex>=0)reportsTo=lines.splice(reportIndex,1)[0].trim();
  const whyIndex=lines.findIndex(line=>/^Why Join (Desi Dragon|Pearl & Leaf)$/.test(cleanLine(line)));
  return {
    main:(whyIndex<0?lines:lines.slice(0,whyIndex)).join('\n').trim(),
    whyTitle:whyIndex<0?'':cleanLine(lines[whyIndex]),
    why:whyIndex<0?'':lines.slice(whyIndex+1).join('\n').trim(),
    reportsTo,
  };
}

export const dynamic='force-dynamic';

export default async function Page({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{preview?:string}>}){
  const {slug}=await params;
  const preview=previewEnabled()&&((await searchParams).preview==='1'||!databaseReady());
  const list=preview?sampleJobs:await jobs();
  const job=list.find(j=>j.slug===slug);
  if(!job)notFound();
  const accepting=!preview&&intakeReady();
  const description=splitDescription(job.description);
  return <>
    <p><a href="/careers">← All opportunities</a></p>
    <div className="jobs-role">
      <article className="jobs-role-copy">
        <p className="jobs-eyebrow">{job.brand}</p>
        <h1>{job.title}</h1>
        <p>{job.location} · {job.employment_type}</p>
        <p className="jobs-pay">{job.compensation}</p>
        {description.reportsTo&&<p className="jobs-reports-to">{description.reportsTo}</p>}
        <h2>The role</h2><JobText text={description.main}/>
        <h2>What you’ll bring</h2><JobText text={job.requirements}/>
        {description.why&&<><h2>{description.whyTitle}</h2><JobText text={description.why}/></>}
        {(accepting||preview)&&job.application_instructions&&<><h2>Application materials</h2><JobText text={job.application_instructions}/></>}
      </article>
      {accepting||preview
        ? <ApplicationForm job={job} enabled={accepting} preview={preview}/>
        : <aside className="jobs-card"><h2>Applications opening soon</h2><p>We’re sharing this role while we finish setting up our application portal. Please check back here to apply.</p><a href="/careers">See all openings →</a></aside>}
    </div>
  </>;
}
