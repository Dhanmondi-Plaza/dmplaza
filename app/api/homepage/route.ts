import {readBoundedBody} from '../../../features/careers-validation';

export async function POST(request:Request){
  const url=new URL(request.url);
  if(request.headers.get('origin')!==url.origin)return Response.json({error:'Submit from the DM Plaza website.'},{status:403});
  if(!request.headers.get('content-type')?.startsWith('application/json'))return Response.json({error:'Invalid submission.'},{status:415});
  const webhook=process.env.GHL_HOMEPAGE_WEBHOOK_URL;
  if(!webhook)return Response.json({error:'Signup is temporarily unavailable.'},{status:503});
  try{
    const data=JSON.parse(new TextDecoder().decode(await readBoundedBody(request,8192)));
    const field=(key:string,max:number)=>typeof data?.[key]==='string'?data[key].trim().slice(0,max):'';
    const first_name=field('first_name',80),last_name=field('last_name',80),email=field('email',254);
    const phone=field('phone',30),message=field('message',1000),interest=field('interest',80);
    const email_consent=data?.email_consent==='yes'?'yes':'no';
    const sms_consent=data?.sms_consent==='yes'?'yes':'no';
    if(!first_name||!/^\S+@\S+\.\S+$/.test(email)||!['yes','no'].includes(data?.email_consent)||!['yes','no'].includes(data?.sms_consent)||
      (email_consent==='no'&&sms_consent==='no')||(sms_consent==='yes'&&!/^\+?[\d ()-]{10,30}$/.test(phone)))
      return Response.json({error:'Check the required fields and consent choices.'},{status:400});
    let page:URL;
    try{page=new URL(field('page_url',500)||url.origin,url.origin)}catch{return Response.json({error:'Invalid page.'},{status:400})}
    if(page.origin!==url.origin||!['/','/index.html'].includes(page.pathname))return Response.json({error:'Invalid page.'},{status:400});
    const upstream=await fetch(webhook,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      first_name,last_name,email,phone:sms_consent==='yes'?phone:'',message,interest,
      brand:'DM Plaza',form_name:'Homepage',email_consent,sms_consent,page_url:page.href
    }),signal:AbortSignal.timeout(10000)});
    if(!upstream.ok)throw new Error(`GHL returned ${upstream.status}`);
    return Response.json({ok:true});
  }catch(error){
    if(error instanceof SyntaxError||error instanceof Error&&['BODY_TOO_LARGE','EMPTY_BODY'].includes(error.message))
      return Response.json({error:'Invalid submission.'},{status:400});
    console.error('Homepage signup could not reach GHL',error instanceof Error?error.message:'Unknown error');
    return Response.json({error:'Signup could not be confirmed.'},{status:502});
  }
}
