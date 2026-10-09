import 'server-only';
import {createClient} from '@supabase/supabase-js';
import {createHash,createHmac} from 'node:crypto';
import {isIP} from 'node:net';
import {applicationSchema,type Job} from './careers-domain';
import {validateResume,MAX_RESUME_BYTES} from './careers-validation';
import {validateAnswers} from './hiring-questions';
export class PortalError extends Error {constructor(message:string,public status=400){super(message)}}
export const previewEnabled=()=>process.env.CAREERS_PREVIEW==='true'&&!process.env.VERCEL;
export const databaseReady=()=>!!(process.env.SUPABASE_URL&&process.env.SUPABASE_PUBLISHABLE_KEY&&process.env.SUPABASE_ORGANIZATION_ID);
export const intakeReady=()=>databaseReady()&&process.env.CAREERS_APPLICATIONS_ENABLED==='true'&&!!process.env.SUPABASE_SECRET_KEY&&(process.env.CAREERS_RATE_LIMIT_SECRET?.length||0)>=32&&!!process.env.CAREERS_ORIGIN;
function client(secret=false){if(!databaseReady()||(secret&&!intakeReady()))throw new PortalError('Applications are not open yet. Please check back soon.',503);return createClient(process.env.SUPABASE_URL!,secret?process.env.SUPABASE_SECRET_KEY!:process.env.SUPABASE_PUBLISHABLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}})}
export function sameOrigin(req:Request){const origin=req.headers.get('origin');const u=new URL(req.url);if(!process.env.CAREERS_ORIGIN||origin!==process.env.CAREERS_ORIGIN||u.origin!==origin)throw new PortalError('Please submit from the careers page.',403);if(u.protocol!=='https:'&&!(previewEnabled()&&['127.0.0.1','localhost'].includes(u.hostname)))throw new PortalError('Secure connection required.',403)}
export async function jobs():Promise<Job[]>{if(!databaseReady())return [];const r=await client().schema('os_api').rpc('list_careers_jobs',{p_organization:process.env.SUPABASE_ORGANIZATION_ID});if(r.error)throw new PortalError('Openings could not be loaded. Please try again shortly.',503);return (r.data||[]).map((j:Record<string,unknown>)=>({...j,visibility:'published',version:1})) as Job[];}
const digest=(v:Uint8Array|string)=>createHash('sha256').update(v).digest('hex');
export async function apply(req:Request,form:FormData){sameOrigin(req);const db=client(true);const get=(key:string)=>typeof form.get(key)==='string'?String(form.get(key)):'';
 let answers:unknown,attribution:unknown;try{answers=JSON.parse(get('answers')||'{}');attribution=JSON.parse(get('attribution')||'{}')}catch{throw new PortalError('Check your application answers.')}
 const parsed=applicationSchema.safeParse({...Object.fromEntries(['jobId','requestKey','name','email','phone','source','sourceDetails','availability','experience','linkedin','portfolio','coverLetter','consent','website'].map(k=>[k,get(k)])),answers,attribution});
 if(!parsed.success)throw new PortalError(parsed.error.issues[0]?.message||'Check the application.');const fields=parsed.data;
 const job=(await jobs()).find(j=>j.id===fields.jobId);if(!job)throw new PortalError('This role is no longer accepting applications.',409);
 if(job.portfolio_required&&!fields.portfolio.trim())throw new PortalError('A portfolio / work sample link is required for this role.');
 if(job.linkedin_required&&!fields.linkedin.trim())throw new PortalError('A LinkedIn profile is required for this role.');
 const invalid=validateAnswers(job.questions||[],fields.answers);if(invalid)throw new PortalError(invalid);
 if(!(form.get('resume') instanceof File)||(form.get('resume') as File).size===0)throw new PortalError('This role requires a PDF résumé.');
 const uploads:{key:string;name:string;bytes:Uint8Array}[]=[];
 const resume=form.get('resume');if(resume instanceof File&&resume.size)uploads.push({key:'resume.pdf',name:resume.name.slice(0,150),bytes:new Uint8Array(await resume.arrayBuffer())});
 const extras=form.getAll('extras').filter((f):f is File=>f instanceof File&&f.size>0);if(extras.length>2)throw new PortalError('Attach at most two additional PDF files.');for(let i=0;i<extras.length;i++)uploads.push({key:`extra-${i}.pdf`,name:extras[i].name.slice(0,150),bytes:new Uint8Array(await extras[i].arrayBuffer())});
 if(uploads.reduce((n,f)=>n+f.bytes.length,0)>MAX_RESUME_BYTES)throw new PortalError('All PDF files must total 3 MB or less.');for(const f of uploads){const error=validateResume(f.bytes,'application/pdf');if(error)throw new PortalError(error)}
 const u=new URL(req.url);const ip=process.env.VERCEL?req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim():previewEnabled()&&['127.0.0.1','localhost'].includes(u.hostname)?'127.0.0.1':null;if(!ip||!isIP(ip))throw new PortalError('Application intake is temporarily unavailable.',503);
 const hash=(v:string)=>createHmac('sha256',process.env.CAREERS_RATE_LIMIT_SECRET!).update(v).digest('hex');const files=uploads.map(f=>({key:f.key,name:f.name,size:f.bytes.length,hash:digest(f.bytes)}));
 const reserved=await db.schema('os_api').rpc('reserve_careers_application',{p_organization:process.env.SUPABASE_ORGANIZATION_ID,p_job:fields.jobId,p_request_key:fields.requestKey,p_ip_hash:hash('ip:'+ip),p_email_hash:hash('email:'+fields.email),p_payload_hash:digest(JSON.stringify({fields,files})),p_fields:fields,p_files:files});
 if(reserved.error)fail(reserved.error.message);const r=reserved.data;if(!r?.intake_id)throw new PortalError('Could not start the application.',503);if(r.application_id)return r.application_id;
 for(const f of uploads){const path=`${process.env.SUPABASE_ORGANIZATION_ID}/${r.intake_id}/${f.key}`;const bucket=db.storage.from('hiring-resumes');const uploaded=await bucket.upload(path,f.bytes,{contentType:'application/pdf',upsert:false});if(uploaded.error){const prior=await bucket.download(path);if(prior.error||!prior.data||digest(new Uint8Array(await prior.data.arrayBuffer()))!==digest(f.bytes))throw new PortalError('A file could not be saved. Retry the same application.',503)}}
 const done=await db.schema('os_api').rpc('complete_careers_application',{p_intake:r.intake_id});if(done.error)fail(done.error.message);if(!done.data)throw new PortalError('Confirmation unavailable. Retry the same application.',503);return done.data;
}
function fail(message:string):never{if(/limit/i.test(message))throw new PortalError('Too many attempts. Please try again later.',429);if(/closed|not accepting/i.test(message))throw new PortalError('This role is no longer accepting applications.',409);if(/expired|different input/i.test(message))throw new PortalError('The application changed or expired. Reload and try again.',409);throw new PortalError('The application was not confirmed. Please retry.',503)}
