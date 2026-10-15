const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {stripTypeScriptTypes}=require('node:module');
const {pathToFileURL}=require('node:url');

const file=require('node:path').join(__dirname,'../app/api/homepage/route.ts');
const validation=pathToFileURL(require('node:path').join(__dirname,'../features/careers-validation.ts')).href;
const source=stripTypeScriptTypes(fs.readFileSync(file,'utf8').replace("'../../../features/careers-validation'",`'${validation}'`));

test('homepage lead forwards consent and fixed source fields only',async()=>{
  const {POST}=await import(`data:text/javascript,${encodeURIComponent(source)}`);
  process.env.GHL_HOMEPAGE_WEBHOOK_URL='https://webhook.example.invalid/test';
  const oldFetch=global.fetch;
  let sent;
  global.fetch=async(_url,options)=>{sent=JSON.parse(options.body);return new Response('ok',{status:200})};
  const body={first_name:' Test ',last_name:'Person',email:'test@example.invalid',phone:'7185550100',message:'Hi',interest:'Events',brand:'Wrong',form_name:'Wrong',email_consent:'yes',sms_consent:'no',page_url:'https://www.dhanmondiplaza.com/'};
  const request=payload=>new Request('https://www.dhanmondiplaza.com/api/homepage',{method:'POST',headers:{origin:'https://www.dhanmondiplaza.com','content-type':'application/json'},body:JSON.stringify(payload)});
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
  }finally{global.fetch=oldFetch;delete process.env.GHL_HOMEPAGE_WEBHOOK_URL}
});
