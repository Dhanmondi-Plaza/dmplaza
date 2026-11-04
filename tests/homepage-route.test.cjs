const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {stripTypeScriptTypes}=require('node:module');
const {pathToFileURL}=require('node:url');

const file=require('node:path').join(__dirname,'../app/api/homepage/route.ts');
const validation=pathToFileURL(require('node:path').join(__dirname,'../features/careers-validation.ts')).href;
const rateHelper=pathToFileURL(require('node:path').join(__dirname,'../features/signup-rate-limit.ts')).href;
const source=stripTypeScriptTypes(fs.readFileSync(file,'utf8').replace("'../../../features/careers-validation'",`'${validation}'`).replace("'../../../features/signup-rate-limit'",`'${rateHelper}'`));

test('homepage lead forwards consent and fixed source fields only',async()=>{
  const {POST}=await import(`data:text/javascript,${encodeURIComponent(source)}`);
  process.env.GHL_HOMEPAGE_WEBHOOK_URL='https://webhook.example.invalid/test';
  const oldFetch=global.fetch;
  const oldEnv={...process.env}; Object.assign(process.env,{VERCEL:'1',SUPABASE_URL:'https://database.invalid',SUPABASE_SECRET_KEY:'test-only-key',SUPABASE_ORGANIZATION_ID:'00000000-0000-4000-8000-000000000001',CAREERS_RATE_LIMIT_SECRET:'test-only-rate-secret-at-least-32-characters'});
  let sent;
  global.fetch=async(_url,options)=>{if(String(_url).includes('/rpc/'))return Response.json(true);sent=JSON.parse(options.body);return new Response('ok',{status:200})};
  const body={first_name:' Test ',last_name:'Person',email:'test@example.invalid',phone:'7185550100',message:'Hi',interest:'Events',brand:'Wrong',form_name:'Wrong',email_consent:'yes',sms_consent:'no',page_url:'https://www.dhanmondiplaza.com/'};
  const request=payload=>new Request('https://www.dhanmondiplaza.com/api/homepage',{method:'POST',headers:{'x-vercel-forwarded-for':'192.0.2.1',origin:'https://www.dhanmondiplaza.com','content-type':'application/json'},body:JSON.stringify(payload)});
  try{
    assert.equal((await POST(request(body))).status,200);
    assert.equal(sent.first_name,'Test');
    assert.equal(sent.brand,'DM Plaza');
    assert.equal(sent.form_name,'Homepage');
    assert.equal(sent.phone,'');
    assert.equal(sent.email_consent,'yes');
    assert.equal(sent.sms_consent,'no');
    assert.equal((await POST(request({...body,email_consent:'no',sms_consent:'no'}))).status,400);
    assert.equal((await POST(request({...body,email_consent:'no',sms_consent:'yes'}))).status,200);
    assert.equal(sent.phone,'7185550100');
    let forwarded=0;
    global.fetch=async(url,options)=>{if(String(url).includes('/rpc/')){const payload=JSON.parse(options.body);assert.equal(payload.p_scope,'homepage');assert.match(payload.p_ip_hash,/^[a-f0-9]{64}$/);assert(!options.body.includes('192.0.2.1'));return Response.json(false)}forwarded++;return new Response('ok')};
    const limited=await POST(request(body));assert.equal(limited.status,429);assert.equal(limited.headers.get('Retry-After'),'600');assert.equal(forwarded,0);
    global.fetch=async()=>Response.json({error:'database details that must stay private'},{status:500});
    const unavailable=await POST(request(body));assert.equal(unavailable.status,503);assert(!JSON.stringify(await unavailable.json()).includes('database details'));
    delete process.env.CAREERS_RATE_LIMIT_SECRET;
    assert.equal((await POST(request(body))).status,503);

  }finally{process.env=oldEnv;global.fetch=oldFetch;delete process.env.GHL_HOMEPAGE_WEBHOOK_URL}
});
