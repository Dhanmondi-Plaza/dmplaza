import 'server-only';
import {createHmac} from 'node:crypto';
import {isIP} from 'node:net';

export async function reserveSignupRequest(request:Request,scope:'homepage'|'bazaar'):Promise<Response|null>{
 const {SUPABASE_URL,SUPABASE_SECRET_KEY,SUPABASE_ORGANIZATION_ID,CAREERS_RATE_LIMIT_SECRET}=process.env;
 const ip=request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim();
 const unavailable=()=>Response.json({error:'Signup is temporarily unavailable. Please try again shortly.'},{status:503,headers:{'Cache-Control':'no-store'}});
 if(!process.env.VERCEL||!ip||!isIP(ip)||!SUPABASE_URL||!SUPABASE_SECRET_KEY||!SUPABASE_ORGANIZATION_ID||(CAREERS_RATE_LIMIT_SECRET?.length||0)<32)return unavailable();
 const hash=createHmac('sha256',CAREERS_RATE_LIMIT_SECRET!).update('signup-ip:'+ip).digest('hex');
 try{
  const response=await fetch(SUPABASE_URL+'/rest/v1/rpc/reserve_public_signup_request',{
   method:'POST',headers:{apikey:SUPABASE_SECRET_KEY,Authorization:'Bearer '+SUPABASE_SECRET_KEY,'Content-Type':'application/json','Content-Profile':'os_api'},
   body:JSON.stringify({p_org:SUPABASE_ORGANIZATION_ID,p_scope:scope,p_ip_hash:hash}),signal:AbortSignal.timeout(5000)
  });
  if(!response.ok)return unavailable();
  const allowed=await response.json();
  if(allowed===true)return null;
  if(allowed===false)return Response.json({error:'Too many signup attempts. Please try again in ten minutes.'},{status:429,headers:{'Retry-After':'600','Cache-Control':'no-store'}});
  return unavailable();
 }catch{return unavailable();}
}
