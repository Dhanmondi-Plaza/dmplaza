const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {stripTypeScriptTypes}=require('node:module');
const {pathToFileURL}=require('node:url');
const path=require('node:path');

const file=path.join(__dirname,'../app/api/lead/route.ts');
const validation=pathToFileURL(path.join(__dirname,'../features/careers-validation.ts')).href;
const source=stripTypeScriptTypes(fs.readFileSync(file,'utf8').replace("'../../../features/careers-validation'",`'${validation}'`));

test('Bazaar signup forwards only opted-in channels and fixed source fields',async()=>{
  const {POST}=await import(`data:text/javascript,${encodeURIComponent(source)}`);
  process.env.GHL_NATURES_BAZAAR_WEBHOOK_URL='https://webhook.example.invalid/test';
  const oldFetch=global.fetch;
  let sent;
  global.fetch=async(_url,options)=>{sent=JSON.parse(options.body);return new Response('ok',{status:200})};
  const base={first_name:' A ',last_name:'B',email:'a@example.invalid',phone:'7185550100',email_consent:'yes',sms_consent:'no',page_url:'https://www.dhanmondiplaza.com/natures-bazaar?lang=en',brand:'Forged'};
  const request=(body,origin='https://www.dhanmondiplaza.com')=>new Request('https://www.dhanmondiplaza.com/api/lead',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)});
  try{
    assert.equal((await POST(request(base))).status,200);
    assert.equal(sent.first_name,'A');
    assert.equal(sent.brand,'Nature’s Bazaar');
    assert.equal(sent.form_name,'Opening Updates');
    assert.equal(sent.phone,'');
    assert.equal(sent.email_consent,'yes');
    assert.equal(sent.sms_consent,'no');
    assert.equal((await POST(request({...base,email_consent:'no',sms_consent:'no'}))).status,400);
    assert.equal((await POST(request({...base,email_consent:'no',sms_consent:'yes',phone:''}))).status,400);
    assert.equal((await POST(request({...base,email_consent:'no',sms_consent:'yes'}))).status,200);
    assert.equal(sent.phone,'7185550100');
    assert.equal((await POST(request(base,'https://evil.example'))).status,403);
    assert.equal((await POST(request({...base,page_url:'https://evil.example/natures-bazaar'}))).status,400);
  }finally{global.fetch=oldFetch;delete process.env.GHL_NATURES_BAZAAR_WEBHOOK_URL}
});
